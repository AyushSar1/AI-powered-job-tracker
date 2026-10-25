const getRecentMessages = (
  conversation,
  limit = 10
) => {
  if (!conversation) {
    return [];
  }

  return conversation.messages.slice(-limit);
};

const formatConversationHistory = (
  messages
) => {
  if (!messages || messages.length === 0) {
    return '';
  }

  return messages
    .map((message) => {
      const role =
        message.role === 'user'
          ? 'User'
          : 'Assistant';

      return `${role}: ${message.content}`;
    })
    .join('\n');
};

module.exports = {
  getRecentMessages,
  formatConversationHistory,
};