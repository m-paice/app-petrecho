import React, { useEffect, useState } from 'react';
import { StyleSheet, Dimensions, ScrollView, ActivityIndicator } from 'react-native';

import CardClient from '../../components/CardClient';

import { PaginationSimple } from '../../components/PaginationSimple';
import { Filters } from './Filters';
import { api } from '../../services/api';
import { Block, Text } from 'galio-framework';

const Clients = ({ navigation }) => {
  const [clients, setClients] = useState([]);
  const [hasClean, setHasClean] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 0,
    total: 0,
    lastPage: 0,
  });

  const fetchClients = (params) => {
    api
      .get('/users', {
        params,
        headers: {
          'Content-Type': 'application/json',
        },
      })
      .then(({ data }) => {
        setPagination({
          currentPage: data.currentPage,
          lastPage: data.lastPage,
          total: data.total,
        });

        setTimeout(() => {
          setIsLoading(false);
          setClients(data.data);
        }, 3000);
        //setClients(data.data);
        //setIsLoading(true);
      });
  };

  navigation.addListener('focus', () => {
    setHasClean(!hasClean);
    fetchClients({});
  });

  const handleNextPage = () => {
    if (pagination.currentPage === pagination.lastPage) return;

    fetchClients({ page: pagination.currentPage + 1 });
  };

  const handlePreviousPage = () => {
    if (pagination.currentPage === 1) return;

    fetchClients({ page: pagination.currentPage - 1 });
  };

  return (
    <ScrollView showsVerticalScrollIndicator={true} contentContainerStyle={styles.card}>
      <Filters fetchClients={fetchClients} hasClean={hasClean} />
      {isLoading ? (
        <ActivityIndicator size="large" colo="#0000ff" />
      ) : (
        <Block>
          {clients.length === 0 && (
            <Text center style={{ marginTop: 20, marginBottom: 20 }}>
              {' '}
              Nenhum registro encontrado{' '}
            </Text>
          )}

          {clients.map((item) => {
            return (
              <CardClient
                navigation={navigation}
                id={item.id}
                nome={item.name}
                telefone={item.cellPhone}
                aniversario={item.birthDate}
              />
            );
          })}
          <PaginationSimple
            currentPage={pagination.currentPage}
            total={pagination.total}
            lastPage={pagination.lastPage}
            handleNextPage={handleNextPage}
            handlePreviousPage={handlePreviousPage}
          />
        </Block>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 8,
  },
});

export default Clients;
