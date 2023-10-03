import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Block, Text } from "galio-framework";
import { lastDayOfMonth } from "date-fns";

import CardReportExit from "../../components/CardReportExit";
import { useRequestFindMany } from "../../components/hooks/useRequestFindMany";
import { formartDate } from "../../utils/formartDate";
import { optionsBirthDate } from "../../constants/month";
import { useColorContext } from "../../context/colors";

const ExitReport = ({ route }) => {
  const { date } = route.params;

  const [valueOut, setValueOut] = useState([]);

  const { execute, response } = useRequestFindMany({ path: "/reports" });

  const { colors } = useColorContext();

  useEffect(() => {
    if (response) {
      setValueOut(response.data.filter((item) => item.out));
    }
  }, [response]);

  useFocusEffect(
    useCallback(() => {
      const month =
        optionsBirthDate.findIndex((item) => item.title === date) + 1;

      const start = new Date(`${new Date().getFullYear()}-${month}-1 00:00:00`);
      const lastDay = formartDate(lastDayOfMonth(start), "YYY-MM-dd");
      const end = new Date(`${lastDay} 23:59:59`);

      execute({
        where: {
          createdAt: {
            $between: [start, end],
          },
        },
      });
    }, [date])
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.BACKGROUND }]}>
      <ScrollView showsVerticalScrollIndicator={true}>
        {valueOut.length === 0 ? (
          <Text color={colors.TEXT}>
            {" "}
            Nenhum relatório encontrado no mês selecionado{" "}
          </Text>
        ) : null}
        {valueOut.map((item, index) => (
          <Block key={index}>
            <CardReportExit
              data={formartDate(item.createdAt, "dd/MM/YYY")}
              nome={item.description}
              value={`R$ ${Number(item.out).toFixed(2).replace(".", ",")}`}
            />
          </Block>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 8,
  },
  totalValue: {
    color: "#00CED1",
    fontSize: 20,
  },
  totalValueText: {
    fontSize: 16,
    fontWeight: "500",
  },
  wraperTotalValue: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
  },
});
export default ExitReport;
