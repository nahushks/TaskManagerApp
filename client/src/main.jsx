import React from 'react'
import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import App from './App.jsx'
import TaskList from './components/TaskList.jsx'
import TaskDetail from './components/TaskDetail.jsx'
import AddTask from './components/AddTask.jsx'
import { loadTasks, loadTask } from './api/tasks.js'
import './index.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <TaskList />,
        loader: loadTasks
      },
      {
        path: 'detail/:id',
        element: <TaskDetail />,
        loader: ({ params }) => loadTask(params.id)
      },
      {
        path: 'add',
        element: <AddTask />
      }
    ]
  }
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
