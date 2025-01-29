const express = require('express');
const User = require('../Models/User');
const RaiseTicket = require('../Models/RaiseTicket');
const TicketImages = require('../Models/TicketImages');
const ProfileImage = require('../Models/ProfileImage'); // Adjust the path as necessary
const UserDetails = require('../Models/UserDetails'); // Adjust the path as necessary
const { authenticateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const router = express.Router();
const moment = require('moment');
const ImageKit = require('imagekit');
const multer = require('multer');
const mongoose = require("mongoose");

// Initialize ImageKit
const imagekit = new ImageKit({
    publicKey: "public_G3rSC0rgxhiVVqft86ZkEKqD9sA=",
    privateKey: "private_vWsfB7hrX0dfcN2EiFSR5FTepvA=",
    urlEndpoint: "https://ik.imagekit.io/Pharmacy",
});

// Multer setup for file uploads
const upload = multer({ storage: multer.memoryStorage() });


// Add a ticket with multiple images
router.post('/addtickets', authenticateToken, upload.array('images', 10), async (req, res) => {
    try {
        const { Raiser_id, subject, issue, category } = req.body;
        // Generate ticket number
        let ticket_no = "#T00001";
        const lastTicket = await RaiseTicket.findOne().sort({ ticket_id: -1 }); 
        if (lastTicket) {
            const lastNumber = parseInt(lastTicket.ticket_no.replace("#T", ""), 10);
            ticket_no = `#T${String(lastNumber + 1).padStart(5, "0")}`;
        }
        // Create the ticket
        const ticket = new RaiseTicket({
            ticket_no,
            Raiser_id,
            subject,
            category,
            issue,
        });
        await ticket.save();
        // Upload images to ImageKit and save their references
        if (req.files && req.files.length > 0) {
            const imagePromises = req.files.map(async (file) => {
                const result = await imagekit.upload({
                    file: file.buffer,
                    fileName: file.originalname,
                });
                // Save the uploaded image details in the database
                const ticketImage = new TicketImages({
                    ticket_id: ticket._id,
                    image_url_ticket: result.url,
                    imagekit_file_id: result.fileId,
                });
                await ticketImage.save(); 
            });
            await Promise.all(imagePromises); 
        }
        // Respond with the created ticket
        res.status(201).json(ticket);
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Delete a ticket and associated images based on ticket_id
router.delete('/tickets/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;
    console.log("log the tricket_id", ticket_id)
    try {
        // Aggregate to find the ticket along with associated images
        const ticket = await RaiseTicket.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(ticket_id) },  // Match the ticket_id
            },
            {
                $lookup: {
                    from: 'ticketimages',  // The name of the TicketImages collection in MongoDB
                    localField: '_id',  // Field from RaiseTicket model
                    foreignField: 'ticket_id',  // Field from TicketImages model
                    as: 'images',  // Alias for the resulting joined data
                },
            },
        ]);
    
        if (!ticket || ticket.length === 0) {
            return res.status(404).json({ message: 'Ticket not found' });
        }

        // Check if the ticket status is "New_ticket"
        if (ticket[0].status !== 'New_ticket') {
            return res.status(400).json({ message: 'Only tickets with status "New_ticket" can be deleted' });
        }

        // Delete associated images from ImageKit and the database
        const images = ticket[0].images;

        if (images && images.length > 0) {
            const imageDeletionPromises = images.map(async (image) => {
                // Delete from ImageKit
                if (image.imagekit_file_id) {
                    await imagekit.deleteFile(image.imagekit_file_id);
                }
                // Delete from TicketImages collection
                await TicketImages.deleteOne({ _id: image._id });
            });
            await Promise.all(imageDeletionPromises);
        }

        // Delete the ticket from the databas
        await RaiseTicket.deleteOne({ _id: ticket_id });

        res.status(200).json({ message: `Ticket with ID ${ticket_id} and associated images deleted successfully` });
    } catch (error) {
        console.error('Error deleting ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



// Update ticket status, remarks, and Resolver_id
router.put('/tickets/:ticket_id', async (req, res) => {
    const { ticket_id } = req.params;
    const { status, remarks, user_id } = req.body;

    try {
        // Find the ticket by ticket_id
        const ticket = await RaiseTicket.findById(ticket_id);

        if (!ticket) {
            return res.status(404).json({ error: 'Ticket not found' });
        }

        // Update ticket details
        ticket.status = status;
        ticket.remarks = remarks;
        ticket.Resolver_id = user_id;

        // Save the updated ticket
        await ticket.save();

        res.status(200).json(ticket);
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



router.get('/fetchalltickets', authenticateToken, async (req, res) => {
    const { subject, start_date, end_date } = req.query;
    const matchStage = {};
    
    if (subject) matchStage.subject = { $regex: subject, $options: 'i' };
    if (start_date || end_date) {
        matchStage.createdAt = {};
        if (start_date) matchStage.createdAt.$gte = new Date(start_date);
        if (end_date) matchStage.createdAt.$lte = new Date(end_date);
    }

    try {
        const result = await RaiseTicket.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    tickets: [
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'raiser',
                                foreignField: '_id',
                                as: 'raiser',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: 'profileimages',
                                            localField: 'profileImage',
                                            foreignField: '_id',
                                            as: 'profileImage'
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'userdetails',
                                            localField: 'userDetails',
                                            foreignField: '_id',
                                            as: 'userDetails'
                                        }
                                    },
                                    { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                                    { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
                                    { $project: { password: 0, Role_id: 0, Is_active: 0 } }
                                ]
                            }
                        },
                        { $unwind: { path: '$raiser', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'resolver',
                                foreignField: '_id',
                                as: 'resolver',
                                pipeline: [
                                    {
                                        $lookup: {
                                            from: 'profileimages',
                                            localField: 'profileImage',
                                            foreignField: '_id',
                                            as: 'profileImage'
                                        }
                                    },
                                    {
                                        $lookup: {
                                            from: 'userdetails',
                                            localField: 'userDetails',
                                            foreignField: '_id',
                                            as: 'userDetails'
                                        }
                                    },
                                    { $unwind: { path: '$profileImage', preserveNullAndEmptyArrays: true } },
                                    { $unwind: { path: '$userDetails', preserveNullAndEmptyArrays: true } },
                                    { $project: { password: 0, Role_id: 0, Is_active: 0 } }
                                ]
                            }
                        },
                        { $unwind: { path: '$resolver', preserveNullAndEmptyArrays: true } },
                        {
                            $lookup: {
                                from: 'ticketimages',
                                localField: '_id',
                                foreignField: 'ticketId',
                                as: 'images'
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                id: '$_id',
                                createdAt: 1,
                                updatedAt: 1,
                                subject: 1,
                                status: 1,
                                raiser: 1,
                                resolver: 1,
                                images: 1
                            }
                        }
                    ],
                    counts: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 }
                            }
                        },
                        {
                            $group: {
                                _id: null,
                                counts: {
                                    $push: {
                                        k: '$_id',
                                        v: '$count'
                                    }
                                }
                            }
                        },
                        {
                            $replaceRoot: {
                                newRoot: {
                                    $mergeObjects: [
                                        { New_ticket: 0, Solved: 0, 'In-progress': 0, Rejected: 0 },
                                        { $arrayToObject: '$counts' }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                _id: 0,
                                New_ticket: 1,
                                Solved: 1,
                                InProgress: '$In-progress',
                                Rejected: 1
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    tickets: '$tickets',
                    counts: { $arrayElemAt: ['$counts', 0] }
                }
            }
        ]);

        console.log("result the", result)
        res.status(200).json(result[0]);
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({ error: 'Failed to fetch tickets' });
    }
});





router.get('/tickets/raiser/:user_id', authenticateToken, async (req, res) => {
  const { user_id } = req.params;
  const { subject, start_date, end_date } = req.query;
  console.log("log the data", subject, start_date, end_date);

  try {
      // Build query filters dynamically
      const filters = {};
      if (subject) {
          filters.subject = { $regex: subject, $options: 'i' }; // Case-insensitive partial match
      }
      if (start_date && end_date) {
          filters.createdAt = { $gte: new Date(start_date), $lte: new Date(end_date) }; // Date range filter
      } else if (start_date) {
          filters.createdAt = { $gte: new Date(start_date) }; // Start date filter
      } else if (end_date) {
          filters.createdAt = { $lte: new Date(end_date) }; // End date filter
      }

      // Aggregation pipeline
      const ticketsPipeline = [
          {
              $match: {
                  Raiser_id: new mongoose.Types.ObjectId(user_id),
                  ...filters,
              },
          },
          {
              $lookup: {
                  from: 'users', // 'users' collection
                  localField: 'Raiser_id', // Reference in RaiseTicket
                  foreignField: '_id', // Reference in Users
                  as: 'raiser',
              },
          },
          {
              $unwind: { path: '$raiser', preserveNullAndEmptyArrays: true },
          },
          {
              $lookup: {
                  from: 'profileimages', // 'profileimages' collection
                  localField: 'raiser.profileImageId', // Field in Users collection
                  foreignField: '_id',
                  as: 'raiser.profileImage',
              },
          },
          {
              $lookup: {
                  from: 'userdetails', // 'userdetails' collection
                  localField: 'raiser.userDetailsId', // Field in Users collection
                  foreignField: '_id',
                  as: 'raiser.userDetails',
              },
          },
          {
              $lookup: {
                  from: 'users', // 'users' collection for resolver
                  localField: 'resolverId', // Field in RaiseTicket
                  foreignField: '_id', // Reference in Users
                  as: 'resolver',
              },
          },
          {
              $unwind: { path: '$resolver', preserveNullAndEmptyArrays: true },
          },
          {
              $lookup: {
                  from: 'profileimages', // 'profileimages' collection for resolver
                  localField: 'resolver.profileImageId', // Field in Users collection
                  foreignField: '_id',
                  as: 'resolver.profileImage',
              },
          },
          {
              $lookup: {
                  from: 'userdetails', // 'userdetails' collection for resolver
                  localField: 'resolver.userDetailsId', // Field in Users collection
                  foreignField: '_id',
                  as: 'resolver.userDetails',
              },
          },
          {
              $lookup: {
                  from: 'ticketimages', // 'ticketimages' collection
                  localField: '_id', // Reference in RaiseTicket
                  foreignField: 'ticketId', // Reference in TicketImages collection
                  as: 'images',
              },
          },
          {
              $addFields: {
                  imageCount: { $size: '$images' }, // Add field to count the number of images
                  ticket_id: '$_id', // Rename _id to ticket_id
              },
          },
          {
              $project: {
                  'raiser.password': 0,
                  'raiser.Role_id': 0,
                  'raiser.Is_active': 0,
                  'resolver.password': 0,
                  'resolver.Role_id': 0,
                  'resolver.Is_active': 0,
                  'images': 0, // Remove images if you just want the count
                  _id: 0, // Remove _id from the result
              },
          },
      ];

      // Fetch tickets with the aggregation pipeline
      const tickets = await RaiseTicket.aggregate(ticketsPipeline);

      // Fetch status counts for the specified Raiser_id
      const statusCountsPipeline = [
          {
              $match: { Raiser_id: new mongoose.Types.ObjectId(user_id) }, // Match by Raiser_id
          },
          {
              $group: {
                  _id: '$status',
                  count: { $sum: 1 }, // Count the number of occurrences for each status
              },
          },
      ];

      const statusCounts = await RaiseTicket.aggregate(statusCountsPipeline);

      // Convert status counts into an easy-to-use object
      const statusCountsObject = statusCounts.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
      }, {});

      // Ensure all statuses are present in the response
      const counts = {
          New_ticket: statusCountsObject.New_ticket || 0,
          Solved: statusCountsObject.Solved || 0,
          InProgress: statusCountsObject['In-progress'] || 0,
          Rejected: statusCountsObject.Rejected || 0,
      };

      // Send the response
      res.status(200).json({ tickets, counts });
  } catch (error) {
      console.error('Error fetching tickets for Raiser_id:', error);
      res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

//specificticket
router.get('/specificticket/:ticket_id', authenticateToken, async (req, res) => {
  const { ticket_id } = req.params;
  try {
      const ticket = await RaiseTicket.aggregate([
          {
              $match: { _id: new mongoose.Types.ObjectId(ticket_id) },
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'Raiser_id',
                  foreignField: '_id',
                  as: 'raiser',
              },
          },
          { $unwind: { path: '$raiser', preserveNullAndEmptyArrays: true } },
          {
              $lookup: {
                  from: 'profileimages',
                  localField: 'raiser.profileImageId',
                  foreignField: '_id',
                  as: 'raiser.profileImage',
              },
          },
          {
              $lookup: {
                  from: 'userdetails',
                  localField: 'raiser.userDetailsId',
                  foreignField: '_id',
                  as: 'raiser.userDetails',
              },
          },
          {
              $lookup: {
                  from: 'users',
                  localField: 'resolverId',
                  foreignField: '_id',
                  as: 'resolver',
              },
          },
          { $unwind: { path: '$resolver', preserveNullAndEmptyArrays: true } },
          {
              $lookup: {
                  from: 'profileimages',
                  localField: 'resolver.profileImageId',
                  foreignField: '_id',
                  as: 'resolver.profileImage',
              },
          },
          {
              $lookup: {
                  from: 'userdetails',
                  localField: 'resolver.userDetailsId',
                  foreignField: '_id',
                  as: 'resolver.userDetails',
              },
          },
          {
              $lookup: {
                  from: 'ticketimages',
                  localField: '_id',
                  foreignField: 'ticketId',
                  as: 'images',
              },
          },
          {
              $project: {
                  'raiser.password': 0,
                  'raiser.Role_id': 0,
                  'raiser.Is_active': 0,
                  'resolver.password': 0,
                  'resolver.Role_id': 0,
                  'resolver.Is_active': 0,
              },
          },
      ]);
      if (!ticket || ticket.length === 0) {
          return res.status(404).json({ error: 'Ticket not found' });
      }
      res.status(200).json({ ticket: ticket[0] });
  } catch (error) {
      console.error('Error fetching ticket details for Ticket_id:', error);
      res.status(500).json({ error: 'Failed to fetch ticket details' });
  }
});



module.exports = router;