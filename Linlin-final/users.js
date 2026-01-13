const users = {
    dog: {
        username: "dog",
        email: "dog@gmail.com",
    },
    admin: {
        username: "admin",
        email: "admin@gmail.com",
    }
};

function isValid(username) {
    let isValid = true;
    isValid = !!username && username.trim();
    isValid = isValid && username.match(/^[A-Za-z0-9_]+$/);
    return isValid;
}

function getUserData(username) {
    return users[username];
}

function addUserData(username, email) {
    users[username] = { username, email };

}

function getAllUserData() {
    return Object.values(users);
}

export default {
    isValid,
    getUserData,
    addUserData,
    getAllUserData,
};