"use strict";

const activities = {};
let activityIdCounter = 1;

function generateActivityId() {
  return 'act_' + activityIdCounter++;
}

function addActivity(username, type, message, relatedLendingId) {
  const activity = {
    id: generateActivityId(),
    username,
    type,
    message,
    relatedLendingId: relatedLendingId || null,
    timestamp: Date.now(),
    read: false
  };
  
  if (!activities[username]) {
    activities[username] = [];
  }
  
  activities[username].unshift(activity);
  
  if (activities[username].length > 100) {
    activities[username] = activities[username].slice(0, 100);
  }
  
  return activity;
}

function getActivitiesForUser(username) {
  return activities[username] || [];
}

function getUnreadCount(username) {
  const userActivities = activities[username] || [];
  return userActivities.filter(a => !a.read).length;
}

function markAsRead(username, activityId) {
  const userActivities = activities[username] || [];
  const activity = userActivities.find(a => a.id === activityId);
  if (activity) {
    activity.read = true;
    return true;
  }
  return false;
}

function markAllAsRead(username) {
  const userActivities = activities[username] || [];
  userActivities.forEach(a => { a.read = true; });
}

function notifyLendingRequest(borrowerUsername, lenderDisplayName, itemName, lendingId) {
  addActivity(
    borrowerUsername,
    'lending_request',
    lenderDisplayName + ' wants to lend you "' + itemName + '"',
    lendingId
  );
}

function notifyLendingAccepted(lenderUsername, borrowerDisplayName, itemName, lendingId) {
  addActivity(
    lenderUsername,
    'lending_accepted',
    borrowerDisplayName + ' accepted your lending request for "' + itemName + '"',
    lendingId
  );
}

function notifyLendingDeclined(lenderUsername, borrowerDisplayName, itemName, lendingId) {
  addActivity(
    lenderUsername,
    'lending_declined',
    borrowerDisplayName + ' declined your lending request for "' + itemName + '"',
    lendingId
  );
}

function notifyReturnInitiated(lenderUsername, borrowerDisplayName, itemName, lendingId) {
  addActivity(
    lenderUsername,
    'return_initiated',
    borrowerDisplayName + ' is returning "' + itemName + '"',
    lendingId
  );
}

function notifyItemReturned(borrowerUsername, lenderDisplayName, itemName, lendingId) {
  addActivity(
    borrowerUsername,
    'item_returned',
    'You have returned "' + itemName + '" to ' + lenderDisplayName,
    lendingId
  );
}

function notifyExtensionRequested(lenderUsername, borrowerDisplayName, itemName, lendingId) {
  addActivity(
    lenderUsername,
    'extension_requested',
    borrowerDisplayName + ' requested an extension for "' + itemName + '"',
    lendingId
  );
}

function notifyExtensionApproved(borrowerUsername, lenderDisplayName, itemName, lendingId) {
  addActivity(
    borrowerUsername,
    'extension_approved',
    lenderDisplayName + ' approved your extension request for "' + itemName + '"',
    lendingId
  );
}

function notifyExtensionDenied(borrowerUsername, lenderDisplayName, itemName, lendingId) {
  addActivity(
    borrowerUsername,
    'extension_denied',
    lenderDisplayName + ' denied your extension request for "' + itemName + '"',
    lendingId
  );
}

function notifyDueReminder(borrowerUsername, itemName, daysLeft, lendingId) {
  let message = '';
  if (daysLeft > 0) {
    message = 'Reminder: "' + itemName + '" is due in ' + daysLeft + ' day' + (daysLeft > 1 ? 's' : '');
  } else if (daysLeft === 0) {
    message = 'Reminder: "' + itemName + '" is due today';
  }
  addActivity(borrowerUsername, 'due_reminder', message, lendingId);
}

function notifyOverdue(borrowerUsername, itemName, daysOverdue, lendingId) {
  addActivity(
    borrowerUsername,
    'overdue',
    '"' + itemName + '" is ' + daysOverdue + ' day' + (daysOverdue > 1 ? 's' : '') + ' overdue',
    lendingId
  );
}

function notifyDisputeFiled(targetUsername, filedByName, itemName, lendingId) {
  addActivity(
    targetUsername,
    'dispute_filed',
    filedByName + ' filed a dispute regarding "' + itemName + '"',
    lendingId
  );
}

function notifyDisputeResolved(username, itemName, lendingId) {
  addActivity(
    username,
    'dispute_resolved',
    'The dispute for "' + itemName + '" has been resolved',
    lendingId
  );
}

function notifyRatingReceived(username, raterName, rating, lendingId) {
  addActivity(
    username,
    'rating_received',
    raterName + ' gave you a ' + rating + '-star rating',
    lendingId
  );
}

export default {
  addActivity,
  getActivitiesForUser,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  notifyLendingRequest,
  notifyLendingAccepted,
  notifyLendingDeclined,
  notifyReturnInitiated,
  notifyItemReturned,
  notifyExtensionRequested,
  notifyExtensionApproved,
  notifyExtensionDenied,
  notifyDueReminder,
  notifyOverdue,
  notifyDisputeFiled,
  notifyDisputeResolved,
  notifyRatingReceived
};
