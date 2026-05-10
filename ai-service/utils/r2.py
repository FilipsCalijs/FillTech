import os

import boto3
from botocore.config import Config


def upload_to_r2(image_bytes: bytes, content_type: str, generation_id: str) -> str:
    s3 = boto3.client(
        "s3",
        endpoint_url=os.environ["R2_ENDPOINT"],
        aws_access_key_id=os.environ["R2_ACCESS_KEY_ID"],
        aws_secret_access_key=os.environ["R2_SECRET_ACCESS_KEY"],
        config=Config(signature_version="s3v4"),
        region_name="auto",
    )

    key = f"generated/watermark-remove/{generation_id}.png"
    s3.put_object(
        Bucket=os.environ["R2_BUCKET_NAME"],
        Key=key,
        Body=image_bytes,
        ContentType=content_type,
    )

    return f"{os.environ['R2_PUBLIC_URL']}/{key}"
