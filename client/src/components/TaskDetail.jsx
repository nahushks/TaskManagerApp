import { useLoaderData, useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import {
  FaSave,
  FaTrashAlt,
  FaTimes,
  FaCheckCircle,
  FaTag,
} from "react-icons/fa";
import { updateTask, deleteTask } from "../api/tasks";
import "./TaskDetail.css";

function TaskDetail() {
  const task = useLoaderData();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || "",
    complete: task.complete,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await updateTask(task.id, formData);
      navigate("/");
    } catch (err) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      setIsSubmitting(true);
      try {
        await deleteTask(task.id);
        navigate("/");
      } catch (err) {
        setError(err.message);
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="task-detail-container">
      <h2>Edit Task</h2>

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
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="form-group">
            <label>
              <FaTag /> Tags
            </label>
            <div className="task-tags-container">
              {task.tags.map((tag, index) => (
                <span key={index} className="task-tag">
                  {tag}
                </span>
              ))}
            </div>
            <small className="form-help-text">
              Tags are read-only and can only be modified through the API.
            </small>
          </div>
        )}

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
          <button type="submit" disabled={isSubmitting} className="primary">
            <FaSave /> {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
          <Link to="/" className="button secondary">
            <FaTimes /> Cancel
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="danger"
          >
            <FaTrashAlt /> {isSubmitting ? "Deleting..." : "Delete Task"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskDetail;
