import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AddComment } from '../../../components/comments/add-comment';
import { createMemeComment } from '../../../api';

// Mock the createMemeComment function
vi.mock('../../../api', () => ({
  createMemeComment: vi.fn(),
}));

const queryClient = new QueryClient();

const renderAddComment = (props: any) => {
  return render(
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        <AddComment {...props} />
      </QueryClientProvider>
    </ChakraProvider>
  );
};

describe('AddComment Component', () => {
  it('should update input field value when typing', () => {
    renderAddComment({
      memeId: 'dummy_meme_id',
      token: 'dummy_token',
      updateComments: vi.fn(),
    });

    const input = screen.getByPlaceholderText('Type your comment here...');
    fireEvent.change(input, { target: { value: 'New comment' } });

    expect(input).toHaveValue('New comment');
  });

  it('should call createMemeComment and updateComments on successful comment creation', async () => {
    const updateComments = vi.fn();
    (createMemeComment as vi.Mock).mockResolvedValueOnce({});

    renderAddComment({
      memeId: 'dummy_meme_id',
      token: 'dummy_token',
      updateComments,
    });

    const input = screen.getByPlaceholderText('Type your comment here...');
    const button = screen.getByTestId(`add-comment-button-dummy_meme_id`);

    fireEvent.change(input, { target: { value: 'New comment' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(createMemeComment).toHaveBeenCalledWith(
        'dummy_token',
        'dummy_meme_id',
        'New comment'
      );
      expect(updateComments).toHaveBeenCalled();
      expect(input).toHaveValue('');
    });
  });
});
