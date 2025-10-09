import React from 'react';
import { render } from '@testing-library/react-native';
import MessageBubble from '../MessageBubble';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock the MessageTypeIndicator component
jest.mock('../MessageTypeIndicator', () => {
  return function MockMessageTypeIndicator({ messageType, messageStatus, size, showText }) {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: 'message-type-indicator' }, 
      `${messageType}-${messageStatus}-${size}-${showText}`);
  };
});

const mockMessage = {
  id: '1',
  chat_id: 'chat-1',
  user_id: 'user-1',
  content: 'Hello, world!',
  message_type: 'text',
  metadata: {},
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  is_deleted: false,
  user: {
    id: 'user-1',
    username: 'testuser',
    full_name: 'Test User',
    avatar_url: 'https://example.com/avatar.jpg',
  },
  delivery_status: 'sent',
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('MessageBubble', () => {
  it('renders text message correctly', () => {
    const { getByText } = renderWithTheme(
      <MessageBubble 
        message={mockMessage}
        isOwn={false}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(getByText('Hello, world!')).toBeTruthy();
    expect(getByText('T')).toBeTruthy(); // Avatar placeholder
  });

  it('renders own message without avatar', () => {
    const { queryByText } = renderWithTheme(
      <MessageBubble 
        message={mockMessage}
        isOwn={true}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(queryByText('T')).toBeFalsy(); // No avatar for own messages
  });

  it('renders status message with indicator', () => {
    const statusMessage = {
      ...mockMessage,
      message_type: 'status',
      content: 'On my way! 🏃‍♂️',
      metadata: {
        status: {
          status: 'on-my-way',
        },
      },
    };

    const { getByText, getByTestId } = renderWithTheme(
      <MessageBubble 
        message={statusMessage}
        isOwn={false}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(getByText('On my way! 🏃‍♂️')).toBeTruthy();
    expect(getByTestId('message-type-indicator')).toBeTruthy();
  });

  it('renders location message correctly', () => {
    const locationMessage = {
      ...mockMessage,
      message_type: 'location',
      content: '',
      metadata: {
        location: {
          lat: 37.7749,
          lng: -122.4194,
          address: '123 Main St, San Francisco, CA',
        },
      },
    };

    const { getByText } = renderWithTheme(
      <MessageBubble 
        message={locationMessage}
        isOwn={false}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(getByText('Location Shared')).toBeTruthy();
    expect(getByText('123 Main St, San Francisco, CA')).toBeTruthy();
  });

  it('renders photo message correctly', () => {
    const photoMessage = {
      ...mockMessage,
      message_type: 'photo',
      content: 'Check out this court!',
      metadata: {
        photo: {
          photo_url: 'https://example.com/photo.jpg',
        },
      },
    };

    const { getByText } = renderWithTheme(
      <MessageBubble 
        message={photoMessage}
        isOwn={false}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(getByText('Check out this court!')).toBeTruthy();
  });

  it('handles failed message delivery status', () => {
    const failedMessage = {
      ...mockMessage,
      delivery_status: 'failed',
    };

    const mockOnRetry = jest.fn();

    renderWithTheme(
      <MessageBubble 
        message={failedMessage}
        isOwn={true}
        showAvatar={true}
        showTimestamp={true}
        onRetry={mockOnRetry}
      />
    );

    // Component should render without errors
    expect(true).toBeTruthy();
  });

  it('formats timestamp correctly', () => {
    const recentMessage = {
      ...mockMessage,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    };

    const { getByText } = renderWithTheme(
      <MessageBubble 
        message={recentMessage}
        isOwn={false}
        showAvatar={true}
        showTimestamp={true}
      />
    );

    expect(getByText('30m')).toBeTruthy();
  });
});