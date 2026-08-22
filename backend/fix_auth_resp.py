import re

def fix_responses(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Let's add responses to register
    content = content.replace(
        '@router.post("/register", response_model=schemas.UserResponse)',
        '@router.post("/register", response_model=schemas.UserResponse, responses={400: {"description": "Email already registered"}})'
    )
    
    # Add to forgot_password
    content = content.replace(
        '@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED)',
        '@router.post("/forgot-password", status_code=status.HTTP_202_ACCEPTED, responses={400: {"description": "Invalid input"}})'
    )
    
    # Add to reset_password
    content = content.replace(
        '@router.post("/reset-password")',
        '@router.post("/reset-password", responses={400: {"description": "Recovery code is invalid or expired"}, 422: {"description": "Password must be at least 12 characters"}})'
    )

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

fix_responses('app/api/auth.py')
