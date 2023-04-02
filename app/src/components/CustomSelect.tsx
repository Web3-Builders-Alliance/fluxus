import React from "react";
import { Select, ChakraStylesConfig, components } from "chakra-react-select";
import { Control, Controller, FieldValues } from "react-hook-form";
import {
  Box,
  Flex,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Image,
} from "@chakra-ui/react";
import { colors } from "@/styles/theme";

const { Option } = components;

const chakraStyles: ChakraStylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: "transparent",
    color: colors.text[900],
    boxShadow: `0 0 0 0.5px gray`,
    borderColor: "white",
    ":active": {
      borderColor: colors.background[100],
    },
    ":hover": {
      // borderColor: colors.background[500],
    },
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
    ...styles,
    padding: "0 6px",
    backgroundColor: isSelected
      ? colors.background[100]
      : colors.background[500],
    color: colors.text[500],
    ":hover": {
      backgroundColor: colors.background[900],
    },
    borderColor: "white",
  }),
  input: (styles) => ({
    ...styles,
    color: colors.text[900],
  }),
  placeholder: (styles) => ({ ...styles, color: "#718096" }),
  menuList: (styles) => ({
    ...styles,
    backgroundColor: colors.background[500],
  }),
  singleValue: (styles) => ({ ...styles, color: colors.text[900] }),
  dropdownIndicator: (styles) => ({
    ...styles,
    backgroundColor: colors.background[500],
  }),
};

const CustomOption = (props: any) => {
  const { icon, label } = props?.data;
  return (
    <Option {...props} getStyles={chakraStyles.option}>
      <Flex justifyContent={"space-between"} alignItems="center" py="2" px="1">
        <span>{label}</span>
        {icon && (
          <Image
            alt="icon"
            src={icon}
            width="4"
            height="4"
            borderRadius={"full"}
          />
        )}
      </Flex>
    </Option>
  );
};

interface Props {
  label: string;
  options: any;
  name: string;
  placeholder: string;
  error: string;
  control: Control<FieldValues, any> | undefined;
  selectProps: any;
}

const CustomSelect: React.FC<Props> = ({
  label,
  options,
  control,
  name,
  placeholder,
  error,
  selectProps,
  ...props
}) => {
  return (
    <Box {...props} mt="4" w={["full", "full", "md", "md", "md"]}>
      <Controller
        control={control}
        name={name}
        defaultValue={options[0]?.value}
        render={({ field: { onChange, onBlur, value, name } }) => (
          <FormControl isInvalid={!!error}>
            <FormLabel fontSize={"14"} color="gray.400">
              {label}
            </FormLabel>
            <Select
              options={options}
              // defaultValue={options[0]}
              name={name}
              // @ts-ignore
              onChange={(val) => onChange(val?.value)}
              onBlur={onBlur}
              value={value.value}
              placeholder={placeholder}
              closeMenuOnSelect={true}
              components={{ Option: CustomOption }}
              chakraStyles={chakraStyles}
              {...selectProps}
            />
            <FormErrorMessage>{error && error}</FormErrorMessage>
          </FormControl>
        )}
      />
    </Box>
  );
};

export default CustomSelect;
