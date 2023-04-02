import { CheckCircleIcon } from "@chakra-ui/icons";
import { Box, Flex, Icon, Text, useToast } from "@chakra-ui/react";
import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { getUrls, NETWORK } from "../utils";

const useTransactionToast = () => {
  const toast = useToast();
  const transactionToast = (sig: string, type: "tx" | "address") => {
    toast({
      position: "bottom",
      isClosable: true,
      duration: 15000,
      render: () => (
        <Flex
          bg="green.500"
          p="4"
          borderRadius={"6"}
          justifyContent={"flex-start"}
        >
          <Icon as={CheckCircleIcon} color="text.900" h="5" w="5" />
          <Box>
            <Text
              ml="2"
              fontWeight={"semibold"}
              color={"text.900"}
              alignSelf="flex-start"
            >
              Transaction Successful!
            </Text>
            <Flex
              alignItems={"center"}
              onClick={() => window.open(getUrls(NETWORK, sig, type)?.explorer)}
              cursor={"pointer"}
            >
              <Text
                ml="2"
                mt="2"
                color={"text.900"}
                alignSelf="flex-start"
                _hover={{
                  textDecoration: "underline",
                }}
              >
                Check on explorer
              </Text>
              <Icon
                mb="-2"
                ml="3"
                as={FiExternalLink}
                color="text.900"
                h="4"
                w="4"
              />
            </Flex>
          </Box>
        </Flex>
      ),
    });
  };
  return transactionToast;
};

export default useTransactionToast;
