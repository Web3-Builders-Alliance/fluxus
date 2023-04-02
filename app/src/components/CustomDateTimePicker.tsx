import { colors } from "@/styles/theme";
import {
  Box,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";
// @ts-ignore
import DateTimePicker from "react-datetime-picker/dist/entry.nostyle";
import { Control, Controller, FieldValues } from "react-hook-form";

interface Props {
  label: string;
  name: string;
  error: string;
  control: Control<FieldValues, any> | undefined;
  dateTimePickerProps: any;
}

const CustomDateTimePicker: React.FC<Props> = ({
  label,
  control,
  name,
  error,
  dateTimePickerProps,
}) => {
  return (
    <Box
      mt="4"
      w="full"
      userSelect={"none"}
      sx={{
        ".custom-date-time-picker": {
          width: ["full", "full", "md", "md", "md"],
          ".react-datetime-picker__wrapper": {
            padding: "6px",
            borderRadius: "8px",
            color: colors.primary[900],
            border: `1px solid ${error ? "red" : "white"}`,
            width: ["full", "full", "md", "md", "md"],
            display: "flex",
            justifyContent: "space-around",
            svg: {
              stroke: "white",
            },
          },
        },
        ".react-calendar": {
          backgroundColor: colors.background[500],
          color: colors.primary[900],
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid white",
          ".react-calendar__tile": {
            ":hover": {
              backgroundColor: colors.background[100],
            },
          },
          ".react-calendar__tile:disabled": {
            backgroundColor: "gray.700",
            cursor: "not-allowed",
            ":hover": {
              backgroundColor: "gray.700",
            },
          },
          ".react-calendar__tile--now": {
            background: "primary.100",
          },
          ".react-calendar__tile--active": {
            background: "primary.500",
          },
          ".react-calendar__navigation__arrow": {
            backgroundColor: `${colors.background[100]} !important`,
            ":hover": {
              backgroundColor: colors.background[100],
              color: colors.primary[900],
            },
          },
          ".react-calendar__navigation__label": {
            backgroundColor: `${colors.background[100]} !important`,
            ":hover": {
              backgroundColor: colors.background[100],
              color: colors.primary[900],
            },
          },
        },
        ".react-datetime-picker__clock": {
          backgroundColor: colors.background[500],
          borderRadius: "12px",
          border: "1px solid white",

          ".react-clock__face": {
            border: "1px solid white",
            ".react-clock__mark__body": {
              backgroundColor: colors.primary[900],
            },
          },
          ".react-clock__hand__body": {
            backgroundColor: colors.primary[900],
          },
        },
      }}
    >
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <FormControl isInvalid={!!error}>
            <FormLabel fontSize={"14"} color="gray.400">
              {label}
            </FormLabel>
            <DateTimePicker
              dayPlaceholder="dd"
              monthPlaceholder="mm"
              yearPlaceholder="yyyy"
              minutePlaceholder="MM"
              hourPlaceholder="HH"
              // name="datetime"
              nativeInputAriaLabel="Date"
              className="custom-date-time-picker"
              onChange={onChange}
              value={value}
              {...dateTimePickerProps}
            />
            <FormErrorMessage>{error && error.message}</FormErrorMessage>
          </FormControl>
        )}
      />
    </Box>
  );
};

export default CustomDateTimePicker;
