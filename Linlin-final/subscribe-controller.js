const subscribeController = {};
const subscriptions = [];

subscribeController.subscribe = (req, res) => {
    const { contentTypes, comments } = req.body;

    if (
        !contentTypes ||
        typeof contentTypes !== 'object' ||
        !Object.values(contentTypes).some(Boolean)
    ) {
        return res.status(400).json({ error: 'Please select at least one type of content.' });
    }

    if (contentTypes.offers && (!comments || typeof comments !== 'string' || comments.trim() === "")) {
        return res.status(400).json({ error: 'Comments are required when subscribing to offers.' });
    }

    let safeComments = "";
    if (comments && typeof comments === "string") {
        safeComments = comments.slice(0, 500);
    }

    subscriptions.push({ contentTypes, comments: safeComments });
    res.json({ message: 'Subscription successful!' });
};

export default subscribeController;