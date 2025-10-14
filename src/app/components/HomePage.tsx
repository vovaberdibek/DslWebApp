// src/app/components/HomePage.tsx

import React, { useState } from 'react';

const HomePage = () => {
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);

  const addProject = () => {
    if (projectName) {
      setProjects([...projects, projectName]);
      setProjectName('');
      // Here you would also save the project configuration
    }
  };

  return (
    <div>
      <h1>Project Management</h1>
      <input
        type="text"
        value={projectName}
        onChange={(e) => setProjectName(e.target.value)}
        placeholder="Enter project name"
      />
      <button onClick={addProject}>Add Project</button>
      <h2>Existing Projects</h2>
      <ul>
        {projects.map((project, index) => (
          <li key={index}>{project}</li>
        ))}
      </ul>
    </div>
  );
};

export default HomePage;
