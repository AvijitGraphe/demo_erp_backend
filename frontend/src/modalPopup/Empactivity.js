


import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Editor } from 'primereact/editor';
import { Card, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import config from '../config';

function Empactivity({ taskId, task }) {
    const { userId } = useAuth(); // Get userId from the context
    const [comments, setComments] = useState([]);
    const [text, setText] = useState('');
    const [editId, setEditId] = useState(null);

    useEffect(() => {
        fetchComments();
    }, []);

    const fetchComments = async () => {
        try {
            const response = await axios.get(`${config.apiBASEURL}/comments/fetchallcomments/${taskId}`);
            setComments(response.data);

        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const handleSave = async () => {
        if (editId) {
            try {
                const response = await axios.put(`${config.apiBASEURL}/comments/comments/${editId}`, { comment_text: text, user_id: userId });
                setComments(comments.map(comment =>
                    comment.comment_id === editId ? { ...comment, comment_text: text, updatedAt: new Date(), edited: true } : comment
                ));
                setEditId(null);
            } catch (error) {
                console.error('Error updating comment:', error);
            }
        } else {
            try {
                const response = await axios.post(`${config.apiBASEURL}/comments/comments`, { task_id: taskId, comment_text: text, user_id: userId });
                setComments([...comments, response.data]);

            } catch (error) {
                console.error('Error adding comment:', error);
            }
        }
        setText('');
    };

    const handleEdit = (id) => {
        const comment = comments.find(comment => comment.comment_id === id);
        setText(comment.comment_text);
        setEditId(id);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${config.apiBASEURL}/comments/comments/${id}`, { data: { user_id: userId } });
            setComments(comments.filter(comment => comment.comment_id !== id));

        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const formatTime = (time) => {
        const now = new Date();
        const diff = Math.floor((now - new Date(time)) / 1000 / 60);
        if (diff < 1) return 'just now';
        if (diff < 60) return `${diff} mins ago`;
        const hours = Math.floor(diff / 60);
        if (hours < 24) return `${hours} hours ago`;
        const days = Math.floor(hours / 24);
        return `${days} days ago`;
    };


    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    };

    const renderHeader = () => {
        return (
            <span className="ql-formats">
                <button className="ql-bold" aria-label="Bold"></button>
                <button className="ql-italic" aria-label="Italic"></button>
                <button className="ql-underline" aria-label="Underline"></button>
                <button className="ql-strike" aria-label="Strike"></button>
                <button className="ql-blockquote" aria-label="Blockquote"></button>
                <button className="ql-image" aria-label="Image"></button>
                <button className="ql-link" aria-label="Link"></button>
                <button className="ql-list" value="ordered" aria-label="Ordered List"></button>
                <button className="ql-list" value="bullet" aria-label="Unordered List"></button>
            </span>
        );
    };

    const header = renderHeader();

    return (
        <>
            <Row className='mx-0'>
                <Card className='shadow-0 p-0'>
                    <Card.Body className='p-0 pb-4 commentBody'>
                        <h5> {task.project_name}<span>{task.task_name}</span></h5>
                        <ul>
                            {comments.map(comment => (
                                <li key={comment.comment_id}>
                                    <div className='com-user'>{getInitials(comment.user_name)}</div>
                                    <div className='com-text'>
                                        <h6>
                                            {comment.user_name}
                                            <span>
                                                {formatTime(comment.updated_at || comment.created_at)}
                                                {comment.edited && <small>(Edited)</small>}
                                            </span>
                                        </h6>
                                        <p dangerouslySetInnerHTML={{ __html: comment.comment_text }}></p>
                                        {comment.user_id === userId && (
                                            <span>
                                                <Link to='#' className='text-info' onClick={() => handleEdit(comment.comment_id)}>Edit</Link>
                                                <Link to='#' className='text-info' onClick={() => handleDelete(comment.comment_id)}>Delete</Link>
                                            </span>
                                        )}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </Card.Body>
                    <Card.Footer className='p-0 pt-4 shadow-0'>
                        <Editor value={text} onTextChange={(e) => setText(e.htmlValue)} headerTemplate={header} style={{ height: '70px' }} />
                        <div className="d-flex justify-content-end mt-3">
                            <Button label="Save" severity="help" icon="pi pi-plus" size="small" onClick={handleSave} />
                        </div>
                    </Card.Footer>
                </Card>
            </Row>
        </>
    );
}

export default Empactivity;
