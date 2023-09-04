import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Block } from "galio-framework";
import { nowTheme } from "../../constants";

export const ScheduleCard = ({ startAt = 7, endAt = 20.5, payload }) => {
  const startTime = startAt * 60;
  const endTime = endAt * 60;
  const interval = 30;

  const timeSlots = [];
  for (let i = startTime; i <= endTime; i += interval) {
    const hours = Math.floor(i / 60);
    const minutes = i % 60;
    const timeString = `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;

    if (payload.includes(timeString)) {
      timeSlots.push({ time: timeString, schedule: true });

      continue;
    }

    timeSlots.push({ time: timeString, schedule: false });
  }

  return (
    <View style={styles.scheduleCard}>
      <Block center>
        <Text>
          {timeSlots.map(({ time, schedule }, index) => (
            <Block key={index}>
              <TouchableOpacity>
                <Text
                  center
                  size={16}
                  style={schedule ? styles.timeSlot : styles.timeSlotOff}
                >
                  {time}
                </Text>
              </TouchableOpacity>
            </Block>
          ))}
        </Text>
      </Block>
    </View>
  );
};

const styles = StyleSheet.create({
  scheduleCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginVertical: 10,

    paddingVertical: 4,
  },
  timeSlot: {
    width: 60,
    height: 40,
    padding: 8,
    margin: 4,

    borderWidth: 1,
    borderRadius: 5,
    color: "#fff",
    borderColor: "#fff",
    backgroundColor: nowTheme.COLORS.PRIMARY,
  },
  timeSlotOff: {
    width: 60,
    height: 40,
    padding: 8,
    margin: 4,

    borderWidth: 1,
    borderRadius: 5,

    color: "gray",
    borderColor: "gray",
  },
});

export default ScheduleCard;
