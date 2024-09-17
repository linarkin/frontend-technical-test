import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Box, Flex, Input, Button } from '@chakra-ui/react';
import { createMemeComment } from '../../api';

interface AddCommentProps {
  memeId: string;
  token: string;
  updateComments: () => void;
}

export const AddComment: React.FC<AddCommentProps> = ({
  memeId,
  token,
  updateComments,
}) => {
  const [commentContent, setCommentContent] = useState<Record<string, string>>(
    {}
  );

  const { mutate } = useMutation({
    mutationFn: async (data: { memeId: string; content: string }) => {
      await createMemeComment(token, data.memeId, data.content);
    },
    onSuccess: () => {
      updateComments();
      setCommentContent((prev) => ({ ...prev, [memeId]: '' }));
    },
  });

  const createComment = async () => {
    if (commentContent[memeId]) {
      await mutate({
        memeId,
        content: commentContent[memeId],
      });
    }
  };

  return (
    <Box mb={6} mt={6}>
      <Flex alignItems="center" mb={6}>
        <Input
          mr={2}
          placeholder="Type your comment here..."
          onChange={(event) =>
            setCommentContent((prev) => ({
              ...prev,
              [memeId]: event.target.value,
            }))
          }
          value={commentContent[memeId] || ''}
        />
        <Button
          colorScheme="cyan"
          color="white"
          onClick={createComment}
          data-testid={`add-comment-button-${memeId}`}
        >
          Add
        </Button>
      </Flex>
    </Box>
  );
};
