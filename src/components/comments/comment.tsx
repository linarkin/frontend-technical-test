import { useQuery } from '@tanstack/react-query';
import { Avatar, Box, Flex, Text } from '@chakra-ui/react';
import { format } from 'timeago.js';
import { getUserById } from '../../api';
import { Loader } from '../loader';

export const Comment = ({
  comment,
  token,
}: {
  comment: MemeComment;
  token: string;
}) => {
  const { data: author, isLoading: isLoadingAuthor } = useQuery<MemeAuthor>({
    queryKey: ['user', comment.authorId],
    queryFn: () => getUserById(token, comment.authorId),
  });

  return (
    <Flex key={comment.id}>
      {isLoadingAuthor ? (
        <Loader data-testid="meme-feed-loader" />
      ) : (
        <>
          <Avatar
            borderWidth="1px"
            borderColor="gray.300"
            size="sm"
            name={author?.username}
            src={author?.pictureUrl}
            mr={2}
          />
        </>
      )}
      <Box p={2} borderRadius={8} bg="gray.50" flexGrow={1}>
        <Flex justifyContent="space-between" alignItems="center">
          <Text
            data-testid={`meme-comment-author-${comment.memeId}-${comment.id}`}
          >
            {author?.username || 'Unknown'}
          </Text>
          <Text fontStyle="italic" color="gray.500" fontSize="small">
            {format(comment.createdAt)}
          </Text>
        </Flex>
        <Text
          color="gray.500"
          whiteSpace="pre-line"
          data-testid={`meme-comment-content-${comment.memeId}-${comment.id}`}
        >
          {comment.content}
        </Text>
      </Box>
    </Flex>
  );
};
