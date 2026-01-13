import { Project } from '@/types';

export const DEFAULT_DEMO_PROJECT: Project = {
    id: 'demo-project-default',
    name: '🎯 Demo: React Component Practice',
    type: 'editor',
    code: `// React Component: User Profile Card
import React, { useState } from 'react';

interface UserProps {
  name: string;
  email: string;
  avatar?: string;
}

const UserProfile: React.FC<UserProps> = ({ name, email, avatar }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  return (
    <div className="profile-card">
      <img src={avatar || '/default-avatar.png'} alt={name} />
      <h2>{name}</h2>
      <p>{email}</p>
      {isExpanded && (
        <div className="details">
          <button onClick={toggleExpand}>Show Less</button>
        </div>
      )}
      {!isExpanded && (
        <button onClick={toggleExpand}>Show More</button>
      )}
    </div>
  );
};

export default UserProfile;`.split('\n'),
    language: 'typescript',
    createdAt: new Date().toISOString(),
    folderId: null,
    description: 'Practice typing a complete React component with TypeScript. Perfect for beginners!',
    notes: [
        {
            line: 1,
            content: "Import statement brings in React and the useState hook for managing component state."
        },
        {
            line: 3,
            content: "TypeScript interface defines the shape of props this component expects."
        },
        {
            line: 9,
            content: "Functional component declaration with TypeScript type annotation for props."
        },
        {
            line: 10,
            content: "useState hook creates state variable for tracking expanded/collapsed state."
        },
        {
            line: 12,
            content: "Event handler function to toggle the expanded state."
        },
        {
            line: 16,
            content: "JSX return statement starts here - this is what gets rendered to the DOM."
        },
        {
            line: 18,
            content: "Conditional rendering using logical && operator - only shows if isExpanded is true."
        },
        {
            line: 23,
            content: "Alternative conditional rendering for the collapsed state."
        }
    ]
};
