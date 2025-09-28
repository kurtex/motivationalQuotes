# API Documentation

## Endpoints

### `/api/check-scheduled-posts`

- **Method**: POST
- **Description**: Processes scheduled posts that are due.
- **Headers**:
  - `Authorization: Bearer <CRON_SECRET>`
- **Response**:
  - `200`: Successfully processed posts.
  - `401`: Unauthorized.
  - `500`: Internal server error.

### `/api/clear-schedule`

- **Method**: POST
- **Description**: Clears the active schedule for a user.
- **Headers**:
  - `threads-token`: User's Threads token.
- **Response**:
  - `200`: Schedule cleared successfully.
  - `401`: Unauthorized.
  - `404`: No active schedule found.
  - `500`: Internal server error.

### `/api/post-now`

- **Method**: POST
- **Description**: Posts a quote immediately based on a prompt.
- **Headers**:
  - `threads-token`: User's Threads token.
- **Body**:
  - `prompt`: The prompt to generate the quote.
- **Response**:
  - `200`: Quote posted successfully.
  - `400`: Prompt is required.
  - `401`: Unauthorized.
  - `500`: Internal server error.

### `/api/schedule-post`

- **Method**: POST
- **Description**: Creates or updates a recurring schedule for a user.
- **Headers**:
  - `threads-token`: User's Threads token.
- **Body**:
  - `scheduleType`: Type of schedule (`daily`, `weekly`, `custom`).
  - `intervalValue`: Interval value for custom schedules.
  - `intervalUnit`: Interval unit for custom schedules (`hours`, `days`, `weeks`).
  - `timeOfDay`: Time of day for the schedule (`HH:MM`).
- **Response**:
  - `200`: Schedule updated successfully.
  - `400`: Invalid input.
  - `401`: Unauthorized.
  - `500`: Internal server error.

## Models

### `IScheduledPost`

- **Properties**:
  - `userId`: Reference to the User model.
  - `scheduleType`: Type of recurrence (`daily`, `weekly`, `custom`).
  - `intervalValue`: Interval value for custom schedules.
  - `intervalUnit`: Interval unit for custom schedules (`hours`, `days`, `weeks`).
  - `timeOfDay`: Time of day for the schedule (`HH:MM`).
  - `lastPostedAt`: Timestamp of the last successful post.
  - `nextScheduledAt`: Calculated next time this post should occur.
  - `status`: Status of the recurring schedule (`active`, `paused`, `error`).
