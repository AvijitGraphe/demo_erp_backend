const express = require('express');
const Brand_Calander = require('../Models/Brand_Calander');
const Brand = require('../Models/Brand');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const moment = require('moment'); 
const mongoose = require('mongoose');


//add brand calendar
router.post('/brand-calendar', authenticateToken, async (req, res) => {
  const { brand_calander_id, brand_id, event_name, event_date, event_status, event_color } = req.body;
  if (!brand_id || !event_name || !event_date || !event_status || !event_color) {
      return res.status(400).json({ message: 'All fields are required.' });
  }
  const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
  try {
      let event;
      if (brand_calander_id) {
          // Update existing event
          event = await Brand_Calander.findById(brand_calander_id);
          if (!event) {
              return res.status(404).json({ message: 'Event not found.' });
          }
          // Only allow status update if the current status is "Pending"
          const updatedData = { brand_id, event_name, event_date, event_color };
          if (event.event_status === 'Pending') {
              updatedData.event_status = event_status;
          }
          // Update the event
          event = await Brand_Calander.findByIdAndUpdate(brand_calander_id, updatedData, { new: true });
      } else {
          // Create a new event
          if (new Date(event_date) < new Date(today)) {
            return res.status(400).json({ message: 'New events cannot be added for past dates.' });
        }
          event = new Brand_Calander({ brand_id, event_name, event_date, event_status, event_color });
          await event.save();
      }
      res.status(200).json({ message: 'Event saved successfully.', event });
  } catch (error) {
      console.error('Error saving event:', error);
      res.status(500).json({ message: 'An error occurred while saving the event.' });
  }
});

  


// Get events from brand calendar
router.get('/brand-calendar', authenticateToken, async (req, res) => {
  const { start_date, end_date, brand_id } = req.query;

  // Validate that start_date and end_date are provided
  if (!start_date || !end_date) {
    return res.status(400).json({ message: 'Start date and end date are required.' });
  }

  try {
    // Construct the filter object for the query
    let filter = {
      event_date: {
        $gte: new Date(start_date), 
        $lte: new Date(end_date),   
      },
    };

    // Add brand_id filter if provided
    if (brand_id) {
      filter.brand_id = brand_id;
    }    
    // Fetch the events using the filter
    const events = await Brand_Calander.find(filter)
      .populate('brand_id', 'brand_id brand_name');  
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'An error occurred while fetching events.' });
  }
});
  



// Route to fetch events from Brand_Calander within a date range
router.get('/brand-calendar/events', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate and parse dates
    const start = moment(startDate).startOf('day');
    const end = moment(endDate).endOf('day');

    if (!start.isValid() || !end.isValid()) {
      return res.status(400).json({ message: 'Invalid date range' });
    }

    // Fetch events in the date range
    const events = await Brand_Calander.find({
      event_date: {
        $gte: new Date(startDate), 
        $lte: new Date(endDate),
      },
    })
      .populate('brand_id', 'brand_id brand_name') 
      .exec();

    res.status(200).json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});



module.exports = router;
