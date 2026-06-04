import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dm1cwbbfg',
  api_key: '969989851682274',
  api_secret: '6N9cJ9fhanGad1sj--3gssD-vCk'
});

async function test() {
  const result = await cloudinary.search
    .expression('resource_type:video')
    .with_field('tags')
    .with_field('context')
    .with_field('image_metadata')
    .max_results(2)
    .execute();
    
  console.log(JSON.stringify(result.resources, null, 2));
}

test();
