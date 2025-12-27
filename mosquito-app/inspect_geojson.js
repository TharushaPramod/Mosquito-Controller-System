import { readFileSync } from 'fs';
const data = JSON.parse(readFileSync('src/assets/data/sri-lanka-districts.json', 'utf8'));
console.log('Feature count:', data.features.length);
if (data.features.length > 0) {
    console.log('First feature properties:', data.features[0].properties);
}
