import { FluxLogo } from "@/assets/SVGs";
import { HamburgerIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  Text,
  useDisclosure,
  useMediaQuery,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useRef } from "react";
import ConnectWalletButton from "./ConnectWalletButton";

const NavBar = () => {
  const router = useRouter();
  const [isLargerThan678] = useMediaQuery("(min-width: 678px)");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = useRef();
  return (
    <Flex
      justifyContent={"center"}
      bg={"rgba(30, 30, 30, 0.4)"}
      backdropFilter="auto"
      backdropBlur="4px"
      pos="fixed"
      w="full"
      top="0"
      zIndex={1}
    >
      <Container maxW="container.xl">
        <Box>
          <Flex
            flexDirection={"row"}
            justifyContent="space-between"
            alignItems={"center"}
            paddingY={4}
          >
            <Box onClick={() => router.replace("/")} cursor="pointer">
              <FluxLogo
                width={["60px", "100px", "100px", "100px", "100px"]}
                height={["40px", "40px", "50px", "50px", "50px"]}
              />
            </Box>
            <Flex flex="1" justifyContent={"flex-end"} mr="4">
              {isLargerThan678 ? (
                <Flex flexDirection={"row"} alignItems="center">
                  {router.pathname !== "/create-flux" && (
                    <Button
                      variant={"primary"}
                      cursor="pointer"
                      mr="4"
                      onClick={() => router.push("/create-flux")}
                    >
                      Create Flux
                    </Button>
                  )}
                  {router.pathname !== "/" && (
                    <Text
                      color={router.pathname === "/" ? "text.900" : "gray.500"}
                      cursor="pointer"
                      mr="4"
                      onClick={() => router.push("/")}
                    >
                      Dashboard
                    </Text>
                  )}
                </Flex>
              ) : (
                <Box>
                  <HamburgerIcon
                    onClick={onOpen}
                    cursor={"pointer"}
                    color={"text.900"}
                    h="6"
                    w="6"
                  />
                </Box>
              )}
            </Flex>
            <ConnectWalletButton />
          </Flex>
        </Box>
      </Container>
      <Drawer
        isOpen={isOpen}
        placement="top"
        onClose={onClose}
        // @ts-ignore
        finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton color={"text.500"} />
          <DrawerHeader display="flex" bg="background.100" w="full">
            <Box>
              <FluxLogo width={["100px"]} height={["60px"]} />
            </Box>
          </DrawerHeader>
          <DrawerBody bg="background.100">
            {router.pathname !== "/create-flux" && (
              <Button
                variant={"primary"}
                cursor="pointer"
                mr="4"
                onClick={() => router.push("/create-flux")}
              >
                Create Flux
              </Button>
            )}
            {router.pathname !== "/" && (
              <Text
                color={router.pathname === "/" ? "text.900" : "gray.500"}
                py="4"
                cursor={"pointer"}
                userSelect="none"
                onClick={() => {
                  router.push("/");
                  onClose();
                }}
              >
                Dashboard
              </Text>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  );
};

export default NavBar;
