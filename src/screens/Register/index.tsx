import React, { useCallback, useState } from "react";
import { TouchableWithoutFeedback, Keyboard, Alert } from "react-native";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import uuid from "react-native-uuid";

import { UncontrolledInput } from "../../components/Form/UncontrolledInput";
import { Button } from "../../components/Form/Button";
import { CategorySelect } from "../../components/Form/CategorySelect";
import { TransactionTypeButton } from "../../components/Form/TransactionTypeButton";
import { CategoryProps } from "../../components/Form/CategorySelect/CategoriesListModal";

import { Transaction, TransactionType } from "../../services/transactions";

import { useAuth } from "../../hooks/auth";

import {
  Container,
  Header,
  Title,
  Form,
  FormFields,
  TransactionTypeButtons,
} from "./styles";

interface FormData {
  name: string;
  amount: number;
}

const formSchema = Yup.object().shape({
  name: Yup.string().required("Por favor, insira o nome."),
  amount: Yup.number()
    .typeError("Ops, informe um valor númerico.")
    .positive("Ops, o valor não pode ser negativo.")
    .required("Por favor, insira o preço."),
});

export const Register: React.FC = () => {
  const navigation = useNavigation();

  const { user } = useAuth();

  const [selectedTransactionType, setSelectedTransactionType] = useState<
    TransactionType | ""
  >("");
  const [selectedCategory, setSelectedCategory] = useState<
    CategoryProps | undefined
  >(undefined);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: yupResolver(formSchema),
  });

  function handleSelectTransactionType(type: TransactionType): void {
    setSelectedTransactionType(type);
  }

  const handleSelectCategory = useCallback((category: CategoryProps) => {
    setSelectedCategory(category);
  }, []);

  async function handleRegister(formData: FormData): Promise<void> {
    if (!selectedTransactionType) {
      return Alert.alert("Por favor, selecione o tipo da transação!");
    }

    if (!selectedCategory) {
      return Alert.alert("Por favor, selecione a categoria!");
    }

    const data: Transaction = {
      id: String(uuid.v4()),
      name: formData.name,
      amount: formData.amount,
      type: selectedTransactionType,
      category: selectedCategory?.key,
      date: new Date().toISOString(),
    };

    try {
      const storagedTransactions = await AsyncStorage.getItem(
        `@gofinances:${user!.id}:transactions`
      );
      const transactions = storagedTransactions
        ? JSON.parse(storagedTransactions)
        : [];

      const newTransactions = [...transactions, data];

      await AsyncStorage.setItem(
        `@gofinances:${user!.id}:transactions`,
        JSON.stringify(newTransactions)
      );

      setSelectedCategory(undefined);
      setSelectedTransactionType("");
      reset();

      navigation.navigate("Dashboard");
    } catch (error) {
      Alert.alert("Ops, não foi possível salvar!");
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <Title>Cadastro</Title>
        </Header>

        <Form>
          <FormFields>
            <UncontrolledInput
              name="name"
              control={control}
              placeholder="Insira o nome"
              autoCapitalize="sentences"
              autoFocus
              error={errors.name && errors.name.message}
            />

            <UncontrolledInput
              name="amount"
              control={control}
              placeholder="Insira o preço"
              keyboardType="numeric"
              error={errors.amount && errors.amount.message}
            />

            <TransactionTypeButtons>
              <TransactionTypeButton
                type="positive"
                title="Income"
                style={{ marginRight: 15 }}
                isActive={selectedTransactionType === "positive"}
                onPress={() => handleSelectTransactionType("positive")}
              />

              <TransactionTypeButton
                type="negative"
                title="Outcome"
                isActive={selectedTransactionType === "negative"}
                onPress={() => handleSelectTransactionType("negative")}
              />
            </TransactionTypeButtons>

            <CategorySelect
              category={selectedCategory}
              onSelectCategory={handleSelectCategory}
            />
          </FormFields>

          <Button title="Enviar" onPress={handleSubmit(handleRegister)} />
        </Form>
      </Container>
    </TouchableWithoutFeedback>
  );
};
