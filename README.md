# Coding Deployment Instructions

## Setup

1. **Unzip Fovus.zip**: Execute the following command to unzip the Fovus.zip file.

   ```bash
       unzip Fovus.zip
   ```

2. **Add Alias in Bash**: Add the following alias to your bash profile for easier CDK command execution.

   ```bash
   alias cdk="npx aws-cdk"
   ```

   If you prefer to avoid using `npx`, you can install `aws-cdk` globally and replace `cdk` with `npx aws-cdk`.

3. **Create .env file**: Create a `.env` file at the root level of the project and add the following environment variables:
   ```dotenv
   ACCESS_ID_KEY=
   SECRET_ACCESS_KEY=
   REGION=
   BUCKET_NAME=
   TABLE_NAME=
   ```

## Frontend Setup

1. **Navigate to Frontend Directory**: Move to the `frontend` directory.

   ```bash
   cd Fovus/frontend
   ```

2. **Install Dependencies**: Install the required dependencies.

   ```bash
   npm install
   ```

3. **Run Development Server**: Start the development server.
   ```bash
   npm run dev
   ```

## Backend Setup

1. **Navigate to Backend Directory**: Move to the `backend` directory.

   ```bash
   cd ../backend
   ```

2. **Install Dependencies**: Install the required dependencies.
   ```bash
   npm install
   ```

## CDK Deployment

1. **Bootstrap CDK**: Bootstrap the CDK environment.

   ```bash
   cdk bootstrap
   ```

2. **Deploy Infrastructure**: Deploy the AWS infrastructure using CDK.
   ```bash
   cdk deploy
   ```

## References

- AWS CDK Documentation: [Getting Started Guide](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html)
- YouTube Playlist: [AWS CDK Tutorial for Beginners](https://www.youtube.com/playlist?list=PLIGDNOJWiL19mNkS0cilXJPUtZxf2FhTr)
