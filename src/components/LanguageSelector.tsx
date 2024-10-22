import { Box, Button, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { LANGUAGE_VERSIONS } from "../constants";

// Define the type for the props
interface LanguageSelectorProps {
  language: string;
  onSelect: (language: string) => void;
}

// Define the type for LANGUAGE_VERSIONS
interface LanguageVersions {
  [key: string]: string;
}

const languages = Object.entries(LANGUAGE_VERSIONS as LanguageVersions);
const ACTIVE_COLOR = "blue.400";

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ language, onSelect }) => {
  return (
    <Box ml={2} mb={4}>
      <Text mb={2} fontSize="lg">
        Language:
      </Text>
      <Menu isLazy>
        <MenuButton as={Button}>{language}</MenuButton>
        <MenuList bg="#110c1b">
          {languages.map(([lang, version]) => (
            <MenuItem
              key={lang}
              color={lang === language ? ACTIVE_COLOR : ""}
              bg={lang === language ? "gray.900" : "transparent"}
              _hover={{
                color: ACTIVE_COLOR,
                bg: "gray.900",
              }}
              onClick={() => onSelect(lang)}>
              {lang}
              &nbsp;
              <Text as="span" color="gray.600" fontSize="sm">
                {version as string}
              </Text>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </Box>
  );
};

export default LanguageSelector;
