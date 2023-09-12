import { ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import React, { useEffect, useState } from "react";
import { Block, Text, Switch } from "galio-framework";
import { Calendar } from "react-native-calendars";

import { useValidateRequiredFields } from "../../components/hooks/useValidateRequiredFields";
import { useRequestFindOne } from "../../components/hooks/useRequestFindOne";
import { useRequestFindMany } from "../../components/hooks/useRequestFindMany";
import { useRequestCreate } from "../../components/hooks/useRequestCreate";
import { useRequestUpdate } from "../../components/hooks/useRequestUpdate";
import { DateTimePicker } from "../../components/DatePiker";
import { Button, Icon } from "../../components";
import { useToggle } from "../../components/hooks/useToggle";
import { Modal } from "../../components/Modal";

import { formartDate } from "../../utils/formartDate";
import { nowTheme } from "../../constants";
import { Config } from "./Config";
import { UserSearch } from "../../components/UserSearch";
import { LoadingOverlay } from "../../components/LoadingOverlay";

const SchedulesForm = ({ route, navigation }) => {
  const params = route.params;
  const isEditing = params?.itemId;

  const [allServices, setAllServices] = useState([]);
  const [typeView, setTypeView] = useState("all"); // all | selected

  const [fields, setFields] = useState({
    user: null,
    services: [], // value label
    employee: null,
    date: formartDate(new Date(), "dd-MM-yyyy"),
    time: new Date(),
    discount: 0,
    addition: 0,
    isPackage: false,
    status: "pending",
  });
  console.log({ fields });
  const { validate, errors } = useValidateRequiredFields({
    fields: ["user", "services", "employee", "date", "time"],
  });

  const { toggle, onChangeToggle } = useToggle();

  const {
    execute: execFindOne,
    response,
    loading,
  } = useRequestFindOne({
    path: "/schedules",
    id: params?.itemId,
  });

  const {
    execute: execCreate,
    response: responseCreated,
    loading: loadingCreate,
  } = useRequestCreate({
    path: "/schedules",
  });

  const {
    execute: execUpdate,
    response: responseUpdate,
    loading: loadingUpdate,
  } = useRequestUpdate({
    path: "/schedules",
    id: params?.itemId,
  });

  const {
    execute: execServices,
    response: responseServices,
    loading: loadingServices,
  } = useRequestFindMany({
    path: "/services",
    defaultQuery: { perPage: 100 },
  });

  useEffect(() => {
    if (responseCreated) navigation.goBack();
    if (responseUpdate) navigation.goBack();
  }, [responseCreated, responseUpdate]);

  useEffect(() => {
    if (response) {
      setFields({
        user: { value: response?.user?.id, label: response?.user?.name },
        services: response.services.map((item) => ({
          id: item.id,
          isPackage: item.ServiceSchedule.isPackage,
        })),
        employee: {
          value: response?.employee?.id,
          label: response?.employee?.name,
        },
        date: formartDate(response.scheduleAt, "dd-MM-yyyy"),
        time: new Date(response.scheduleAt),
        isPackage: response.isPackage,
        discount:
          Number(response.discount).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            currencyDisplay: "symbol",
          }) || null,
        addition:
          Number(response.addition).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
            currencyDisplay: "symbol",
          }) || null,
        status: response.status,
      });
    }
  }, [response]);

  useEffect(() => {
    if (isEditing) execFindOne();
  }, []);

  // loading services
  useEffect(() => {
    execServices();
  }, []);

  useEffect(() => {
    validate(fields);
  }, [fields]);

  useEffect(() => {
    if (responseServices) {
      setAllServices(responseServices.data);
    }
  }, [responseServices]);

  const handleSubmitCreate = async () => {
    if (Object.values(errors).filter(Boolean).length) return;

    const [day, month, year] = fields.date.split("-");
    const scheduleAt = new Date(
      `${year}-${month}-${day} ${formartDate(fields.time, "HH:mm")}:00`
    );
    const discount = fields.discount
      .toString()
      .replace("R$", "")
      .replace(",", ".");
    const addition = fields.addition
      .toString()
      .replace("R$", "")
      .replace(",", ".");

    const payload = {
      ...fields,
      services: fields.services,
      scheduleAt,
      userId: fields.user.value,
      employeeId: fields.employee.value,
      discount,
      addition,
      status: fields.status,
    };

    execCreate(payload);
  };

  const handleSubmitUpdate = async () => {
    if (Object.values(errors).filter(Boolean).length) return;

    const [day, month, year] = fields.date.split("-");
    const scheduleAt = new Date(
      `${year}-${month}-${day} ${formartDate(fields.time, "HH:mm")}:00`
    );
    const discount = fields?.discount.replace("R$", "").replace(",", ".");
    const addition = fields?.addition.replace("R$", "").replace(",", ".");

    const payload = {
      ...fields,
      services: fields.services,
      scheduleAt,
      userId: fields.user.value,
      employeeId: fields.employee.value,
      discount,
      addition,
      status: fields.status,
    };

    execUpdate(payload);
  };

  const handleChangeService = ({ serviceId }) => {
    if (fields.services.findIndex((item) => item.id === serviceId) !== -1) {
      setFields({
        ...fields,
        services: fields.services.filter((item) => item.id !== serviceId),
      });

      return;
    }

    setFields({
      ...fields,
      services: [...fields.services, { id: serviceId, isPackage: false }],
    });
  };

  const handleChangeIsPackage = ({ serviceId, isPackage }) => {
    setFields({
      ...fields,
      services: fields.services.map((item) => {
        if (item.id === serviceId) {
          return {
            ...item,
            isPackage: isPackage,
          };
        }

        return item;
      }),
    });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <LoadingOverlay
        visible={loading || loadingServices || loadingCreate || loadingUpdate}
      />
      <Block gap={15} flex style={styles.group}>
        <Block>
          <UserSearch
            path="/users"
            query={{ type: "pf" }}
            placeholder="Pesquise um cliente"
            labelText="Cliente"
            onSelectUser={(item) =>
              setFields({
                ...fields,
                user: { value: item.id, label: item.name },
              })
            }
            clear={() => setFields({ ...fields, user: null })}
            value={fields?.user?.label}
            icon="user"
          />
          {errors?.["user"] && (
            <Text center size={14} color={nowTheme.COLORS.PRIMARY}>
              campo obrigatório
            </Text>
          )}
        </Block>

        <Block
          row
          space="between"
          style={{
            alignItems: "center",
            paddingLeft: 20,
          }}
        >
          <Text size={16} bold>
            Serviços
          </Text>

          <Block row gap={20}>
            <TouchableOpacity onPress={() => setTypeView("all")}>
              <Text
                size={16}
                color={typeView === "all" && nowTheme.COLORS.PRIMARY}
              >
                Todos
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setTypeView("selected")}>
              <Text
                size={16}
                color={typeView === "selected" && nowTheme.COLORS.PRIMARY}
              >
                Selecionados ({fields.services.length})
              </Text>
            </TouchableOpacity>
          </Block>
        </Block>

        <ScrollView
          style={{
            maxHeight: 300,
          }}
        >
          <Block gap={10}>
            {(typeView === "selected"
              ? allServices.filter((item) =>
                  fields.services.some((service) => service.id === item.id)
                )
              : allServices
            )
              .sort((a, b) => (a.name > b.name ? 1 : -1))
              .map((item) => {
                const itemSelected =
                  fields.services.findIndex(
                    (service) => service.id === item.id
                  ) !== -1;

                return (
                  <Block>
                    <TouchableOpacity
                      key={item.id}
                      onPress={() =>
                        handleChangeService({ serviceId: item.id })
                      }
                    >
                      <Block
                        row
                        space="between"
                        style={[
                          {
                            backgroundColor: "#eee",
                            padding: 8,
                            borderRadius: 4,
                            flex: 1,
                          },
                          itemSelected
                            ? {
                                backgroundColor: nowTheme.COLORS.PRIMARY,
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                              }
                            : {},
                        ]}
                      >
                        <Text color={itemSelected ? "white" : ""}>
                          {item.name}
                        </Text>
                        <Text color={itemSelected ? "white" : ""}>
                          {Number(item.price).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                            currencyDisplay: "symbol",
                          })}
                        </Text>
                      </Block>
                    </TouchableOpacity>
                    {itemSelected && (
                      <Block row style={styles.details}>
                        <Switch
                          value={
                            fields.services.find(
                              (service) => service.id === item.id
                            )?.isPackage || false
                          }
                          onChange={() =>
                            handleChangeIsPackage({
                              serviceId: item.id,
                              isPackage:
                                !fields.services.find(
                                  (service) => service.id === item.id
                                )?.isPackage || false,
                            })
                          }
                          trackColor={{
                            false: nowTheme.COLORS.HEADER,
                            true: nowTheme.COLORS.PRIMARY,
                          }}
                        />
                        <Text size={16} color={nowTheme.COLORS.PRIMARY}>
                          sessão de pacote
                        </Text>
                      </Block>
                    )}
                  </Block>
                );
              })}
          </Block>
        </ScrollView>
        {errors?.["services"] && (
          <Text center size={14} color={nowTheme.COLORS.PRIMARY}>
            selecione pelo menos 1 serviço
          </Text>
        )}

        <Block>
          <UserSearch
            path="/users"
            query={{ type: "pj" }}
            placeholder="Pesquise um funcionário"
            labelText="Funcionário"
            onSelectUser={(item) =>
              setFields({
                ...fields,
                employee: { value: item.id, label: item.name },
              })
            }
            clear={() => setFields({ ...fields, employee: null })}
            value={fields?.employee?.label}
            icon="user"
          />
          {errors?.["employee"] && (
            <Text center size={14} color={nowTheme.COLORS.PRIMARY}>
              campo obrigatório
            </Text>
          )}
        </Block>

        <Block row space="between" gap={10}>
          <Block flex={1}>
            <Text size={16} bold style={{ marginLeft: 20, marginBottom: 5 }}>
              Data
            </Text>
            <TouchableOpacity
              onPress={onChangeToggle}
              style={styles.buttonDate}
            >
              <Block row gap={10} style={{ alignItems: "center" }}>
                <Icon
                  size={16}
                  color={nowTheme.COLORS.PRIMARY}
                  name="calendar"
                  family="feather"
                />
                <Text size={16} style={{ height: 20 }}>
                  {fields.date}
                </Text>
              </Block>
            </TouchableOpacity>
          </Block>
          {fields.status === "pending" ? (
            <Block flex={1}>
              <Text size={16} bold style={{ marginLeft: 20, marginBottom: 5 }}>
                Horário
              </Text>
              <DateTimePicker
                value={fields.time}
                onChange={(time) => setFields({ ...fields, time })}
              />
            </Block>
          ) : null}
        </Block>

        <Block row right>
          <Switch
            value={fields.isPackage}
            onChange={() =>
              setFields({ ...fields, isPackage: !fields.isPackage })
            }
            trackColor={{
              false: nowTheme.COLORS.HEADER,
              true: nowTheme.COLORS.PRIMARY,
            }}
          />
          <Text
            style={{ paddingBottom: 15, paddingHorizontal: 10 }}
            size={16}
            color={nowTheme.COLORS.PRIMARY}
          >
            Sessão de pacote
          </Text>
        </Block>

        <Block row right>
          <Switch
            onChange={() => setFields({ ...fields, status: "awaiting" })}
            trackColor={{
              false: nowTheme.COLORS.HEADER,
              true: nowTheme.COLORS.PRIMARY,
            }}
          />
          <Text
            style={{ paddingBottom: 15, paddingHorizontal: 10 }}
            size={16}
            color={nowTheme.COLORS.PRIMARY}
          >
            Lista de espera
          </Text>
        </Block>

        <Config setFields={setFields} fields={fields} />
      </Block>

      <Block row center>
        <Button style={styles.button} onPress={() => navigation.goBack()}>
          <Text size={16} bold>
            Voltar
          </Text>
        </Button>
        <Button
          style={styles.primary}
          onPress={isEditing ? handleSubmitUpdate : handleSubmitCreate}
        >
          <Text size={16} bold color="#fff">
            {isEditing ? "Atualizar" : "Cadastrar"}
          </Text>
        </Button>
      </Block>

      <Modal
        title="Selecione uma data"
        isVisible={toggle}
        onRequestClose={onChangeToggle}
        handleCancel={onChangeToggle}
      >
        <Calendar
          onDayPress={(value) => {
            const [year, month, day] = value.dateString.split("-");

            setFields({ ...fields, date: `${day}-${month}-${year}` });
            onChangeToggle();
          }}
        />
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  group: {
    margin: 15,
    borderRadius: 10,
    backgroundColor: "#fff",
    padding: 8,
  },
  serviceItem: {
    paddingBottom: 7,
    paddingRight: 15,
    alignItems: "center",
  },
  button: {
    marginBottom: nowTheme.SIZES.BASE,
    borderRadius: 10,
    width: 120,
    height: 40,
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: nowTheme.COLORS.BORDER,
    backgroundColor: "white",
  },
  primary: {
    marginBottom: nowTheme.SIZES.BASE,
    borderRadius: 10,
    width: 120,
    height: 40,
    backgroundColor: nowTheme.COLORS.PRIMARY,
  },

  buttonDate: {
    borderRadius: 30,
    borderWidth: 1,
    borderColor: nowTheme.COLORS.BORDER,
    height: 44,
    backgroundColor: "#FFFFFF",
    padding: 9,
    width: 178,
  },
  details: {
    borderWidth: 1,
    borderColor: nowTheme.COLORS.PRIMARY,
    borderRadius: 4,
    height: 50,
    borderTopWidth: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    alignItems: "center",
  },
});

export default SchedulesForm;
