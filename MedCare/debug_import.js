import users from './models/users.js';
import { User } from './models/users.js';

console.log('Default export keys:', Object.keys(users));
console.log('users.getUser type:', typeof users.getUser);
console.log('users.isValidUsername type:', typeof users.isValidUsername);
console.log('Named export User type:', typeof User);

if (typeof users.getUser !== 'function') {
    console.error('FAIL: users.getUser is missing!');
    process.exit(1);
} else {
    console.log('PASS: users.getUser is present.');
}
