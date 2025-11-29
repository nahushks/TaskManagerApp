import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaSave, FaTimes, FaCheckCircle } from 'react-icons/fa';
import { createTask } from '../api/tasks';
import './AddTask.css';

function AddTask() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    complete: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await createTask(formData);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="add-task-container">
      <h2>Add New Task</h2>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter task description"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="complete"
            name="complete"
            checked={formData.complete}
            onChange={handleChange}
          />
          <label htmlFor="complete">
            <FaCheckCircle /> Mark as complete
          </label>
        </div>
        
        <div className="form-actions">
          <button 
            type="submit" 
            disabled={isSubmitting}
          >
            <FaSave /> {isSubmitting ? 'Creating...' : 'Create Task'}
          </button>
          <Link to="/" className="button secondary">
            <FaTimes /> Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

export default AddTask; 