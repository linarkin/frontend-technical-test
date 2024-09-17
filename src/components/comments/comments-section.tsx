import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMemeComments } from '../../api';
import { Loader } from '../loader';
import { Comment } from './comment';
import { AddComment } from './add-comment';
import {
  Box,
  Collapse,
  Flex,
  Icon,
  LinkBox,
  LinkOverlay,
  Text,
  VStack,
} from '@chakra-ui/react';
import { CaretDown, CaretUp, Chat } from '@phosphor-icons/react';

export const MemeCommentsSection = ({
  memeId,
  token,
}: {
  memeId: string;
  token: string;
}) => {
  const {
    data: memeComments,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['memeComments', memeId],
    queryFn: () => getMemeComments(token, memeId, 1),
    enabled: !!memeId,
  });

  const [openedCommentSection, setOpenedCommentSection] = useState<
    string | null
  >(null);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      <LinkBox as={Box} py={2} borderBottom="1px solid black">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex alignItems="center">
            <LinkOverlay
              data-testid={`meme-comments-${memeId}`}
              cursor="pointer"
              onClick={() =>
                setOpenedCommentSection(
                  openedCommentSection === memeId ? null : memeId
                )
              }
            >
              <Text data-testid={`meme-comments-count-${memeId}`}>
                {memeComments?.total || 0} comments
              </Text>
            </LinkOverlay>
            <Icon
              as={openedCommentSection !== memeId ? CaretDown : CaretUp}
              ml={2}
              mt={1}
            />
          </Flex>
          <Icon as={Chat} />
        </Flex>
      </LinkBox>

      <Collapse in={openedCommentSection === memeId} animateOpacity>
        {openedCommentSection === memeId && (
          <Box mb={6} mt={6}>
            <AddComment
              memeId={memeId}
              token={token}
              updateComments={refetch}
            />

            <VStack align="stretch" spacing={4}>
              {memeComments?.results?.map((comment: any) => (
                <Comment key={comment.id} comment={comment} token={token} />
              ))}
            </VStack>
          </Box>
        )}
      </Collapse>
    </>
  );
};
