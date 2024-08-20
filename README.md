# Brighter Bee

**BrighterBee** is a platform for project management designed to streamline projects and enhance productivity with a cloud-based solution. Enjoy a free 1-month trial!

## Features

- Responsive Design
- Light/Dark Theme Toggle
- Interactive Animations with Framer Motion
- Project Management Tools
- Cloud-Based Storage and Syncing
- User Authentication and Authorization
- Notifications System

## Technologies

- **Frontend**: Next.js, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express.js, TypeOrm
- **Database**: Postgres
- **Third Party Package**: Google Scraper, AppStore Scraper
- **Styling**: Tailwind CSS, Shadcn UI
- **Animations**: Framer Motion
- **Utilities**: Next.js Top Loader, Toaster Notifications
- **Font**: Google Fonts (Inter)
- **Version Control**: Git, GitHub

## Installation

To get a local copy up and running, follow these steps:

1. **Clone the repository:**
   ```bash
   git clone <URL>
   cd brighterbee
   ```
2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory and add the required environment variables.

4. **Run the application:**

   ```
    npm run dev
   ```

## Usage

### Running the App

- **Development**: `npm run dev`
- **Production**: `npm run build` and then `npm start`

## Usage

**Brighter Bee** offers a comprehensive set of tools designed to streamline project management, facilitate team collaboration, and ensure effective bug tracking and reporting. Below is a detailed guide on how to use the core features:

### 1. User Authentication and Authorization

- **Login**: Returning users can securely log in to their account using their credentials.
- **Role-Based Access Control**: Depending on the user's role, access to various features and data within the platform is controlled. Admins have full access, while other roles have permissions tailored to their responsibilities.

### 2. Project Management

- **Create Projects**: Users with appropriate permissions can create new projects. Projects can be defined with specific goals, deadlines, and team assignments.
- **Edit and Update Projects**: Existing projects can be edited to reflect changes in scope, timelines, or team members. Users can update project details, assign or reassign tasks, and set priorities.
- **Delete Projects**: Projects that are no longer active can be deleted to maintain an organized workspace.
- **Assign Projects**: Admins and Project Managers can assign projects to specific users, ensuring that each team member knows their responsibilities.
- **Track Project Progress**: The platform provides tools to monitor the status of each project, track milestones, and ensure that deadlines are met.

### 3. Task Management

- **Create and Assign Tasks**: Within each project, tasks can be created and assigned to team members. Tasks include specific instructions, deadlines, and priority levels.
- **Update Task Status**: As tasks are worked on, users can update the task status (e.g., To Do, In Progress, Completed) to reflect current progress.
- **Provide Progress Updates**: Team members can add comments or notes to tasks, providing real-time updates and sharing relevant information with the team.

### 4. Bug Tracking

- **Report Bugs**: Users can report bugs or issues encountered during the project. Each bug report includes a detailed description, steps to reproduce, severity level, and any additional notes.
- **Assign Bugs**: Bugs can be assigned to specific team members who are responsible for resolving the issue.
- **Update Bug Status**: The status of each bug (e.g., Reported, In Progress, Fixed, Closed) can be updated as the issue is addressed.

### 5. Reporting and Analytics

- **Generate Reports**: Users can generate reports that provide insights into project status, task completion rates, bug resolution times, and overall team performance.
- **Analytics Dashboard**: The platform includes a dashboard that visualizes key metrics, helping project managers and team leads make informed decisions based on real-time data.

### 6. Live App Data Integration

- **Google Play & App Store Integration**: The platform can integrate real-time data from Google Play and the App Store, providing valuable insights into app performance, user reviews, and download statistics. This data can be used to inform project decisions and strategies.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. **Fork the repository.**
2. **Create your feature branch:**

   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit your changes:**

   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the branch:**

   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request.**
