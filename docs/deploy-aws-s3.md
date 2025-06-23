# Deploying to AWS S3

This guide explains how to deploy this project to AWS S3 using the provided GitHub Actions workflow.

---

## Prerequisites

- Access to the AWS Console with permissions to create IAM users, S3 buckets, and (optionally) CloudFront distributions.
- Access to the GitHub repository (admin or maintainer permissions to add secrets).

---

## 1. AWS Setup

### a. Create an S3 Bucket
1. Go to the AWS Console → S3 → Create bucket.
2. Choose a unique bucket name (e.g., `my-app-bucket`).
3. Select your preferred AWS region.
4. Enable static website hosting (optional, but recommended for web apps).
5. Note the bucket name and region.

### b. (Optional) Set Up CloudFront
1. Go to AWS Console → CloudFront → Create Distribution.
2. Set the origin domain to your S3 bucket.
3. Configure settings as needed.
4. Note the Distribution ID (for cache invalidation).

### c. Create an IAM User for GitHub Actions
1. Go to AWS Console → IAM → Users → Add user.
2. Set a username (e.g., `github-actions-deploy`).
3. Select "Programmatic access".
4. Attach the following policies:
   - `AmazonS3FullAccess` (or a custom policy with least privilege)
   - `CloudFrontFullAccess` (optional, for cache invalidation)
5. Click "Create user".
6. Create "Access key".
7. Copy the **Access Key ID** and **Secret Access Key** (you will not be able to see the secret again).

---

## 2. Add AWS Secrets to GitHub

1. Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret** for each of the following:
   - `AWS_ACCESS_KEY_ID` (from IAM user)
   - `AWS_SECRET_ACCESS_KEY` (from IAM user)
   - `AWS_REGION` (e.g., `us-east-1`)
   - `S3_BUCKET` (your bucket name)
   - `CLOUDFRONT_DISTRIBUTION_ID` (optional, for cache invalidation)

---

## 3. Trigger the Deployment

### a. Manual Trigger
1. Go to **Actions** tab in your GitHub repository.
2. Select the **Deploy to AWS S3** workflow.
3. Click **Run workflow** (top right) to start a deployment.

### b. Automatic Trigger
- The deployment can also be triggered by the deployment orchestrator after a successful CI pipeline run.

---

## 4. How the Workflow Works

- The workflow installs dependencies, builds the project, configures AWS credentials, and runs the deploy script (`npm run deploy:s3`).
- The deploy script should upload your build output to the specified S3 bucket and (optionally) invalidate the CloudFront cache.

---

## 5. Troubleshooting

- **Missing Secrets:** Ensure all required secrets are set in GitHub.
- **Permission Errors:** Check IAM user permissions and policies.
- **Build Failures:** Check the build logs in the Actions tab.
- **S3/CloudFront Issues:** Verify bucket and distribution IDs, and AWS region.

---

## 6. References
- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/index.html)
- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/index.html)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

For further help, contact the project maintainer or your DevOps team.

---

## Optional Changes in Case of Errors

If you encounter errors such as **Access Denied** or **403 Forbidden** when accessing your deployed site, try the following steps:

### 1. Set a Public Read Bucket Policy

Go to the AWS S3 Console → Your bucket → Permissions → **Bucket Policy** and add the following policy (replace the bucket name if needed):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::deploy-github-actions/*"
    }
  ]
}
```

### 2. Enable Static Website Hosting

- Go to your bucket → **Properties** → **Static website hosting**.
- Enable static website hosting.
- Set the **index document** to `index.html`.
- (Optional) Set the **error document** to `error.html`.
- Save changes.

### 3. Ensure ACLs are Enabled

- Go to **Permissions** → **Object Ownership**.
- Make sure "ACLs enabled" and "Bucket owner preferred" is set (recommended for public sites).
- For each object (file), the "Public" column should show a globe icon (public).

---

## Example Final URLs for Deployed Application

- **S3 Static Website URL:**
  - `http://deploy-github-actions.s3-website.eu-north-1.amazonaws.com/`
  - (Format: `http://<bucket-name>.s3-website-<region>.amazonaws.com/`)

- **CloudFront URL (if configured):**
  - `https://d1234abcd.cloudfront.net/`
  - (Format: `https://<cloudfront-distribution-domain>/`)

--- 