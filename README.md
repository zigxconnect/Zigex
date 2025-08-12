This is  the documentation for futureProspect and how it endpoints works.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Student Endpoints

These endpoints are for authenticated students.

### 1. Task Management (by Student)

#### `GET /api/student/tasks`

-   **Description:** Retrieves all tasks assigned to the currently logged-in student.
-   **Auth:** Student.
-   **Success Response (200):** An array of task objects, joined with mentor details.

#### `PUT /api/student/tasks/[taskId]`

-   **Description:** Updates the status of a specific task. Students can typically only update the `status` field.
-   **Auth:** Student.
-   **Params:** `taskId` - The ID of the task to update.
-   **Request Body:**
    ```json
    {
      "status": "in_progress" // or "completed"
    }
    ```
-   **Success Response (200):** The updated task object.

#### `POST /api/student/tasks/[taskId]/progress`

-   **Description:** Submits a new progress log for a specific task.
-   **Auth:** Student.
-   **Params:** `taskId` - The ID of the task being updated.
-   **Request Body:**
    ```json
    {
      "log_content": "I have successfully cloned the repo and installed all dependencies. The project is running on my local machine. I encountered a small issue with Node versions but resolved it by using NVM."
    }
    ```
-   **Success Response (201):** The newly created progress log object.

### 2. Student Directory

#### `GET /api/students/student`

-   **Description:** Retrieves a list of all other registered students on the platform for networking.
-   **Auth:** Student.
-   **Success Response (200):** An array of public student profiles (name, university, skills, avatar_url).

