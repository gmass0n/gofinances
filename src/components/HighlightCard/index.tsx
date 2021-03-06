import React from "react";

import {
  Container,
  Header,
  Title,
  Icon,
  Footer,
  Amount,
  LastTransaction,
} from "./styles";

export type HighlightCardType = "up" | "down" | "total";

interface HighlightCardProps {
  title: string;
  amount: string;
  lastTransaction: string;
  type: HighlightCardType;
}

const icon: Record<HighlightCardType, string> = {
  up: "arrow-up-circle",
  down: "arrow-down-circle",
  total: "dollar-sign",
};

export const HighlightCard: React.FC<HighlightCardProps> = ({
  amount,
  lastTransaction,
  title,
  type,
}) => {
  return (
    <Container type={type}>
      <Header>
        <Title type={type}>{title}</Title>

        <Icon name={icon[type]} type={type} />
      </Header>

      <Footer>
        <Amount type={type}>{amount}</Amount>

        <LastTransaction type={type}>
          {lastTransaction ? lastTransaction : "Não há transações"}
        </LastTransaction>
      </Footer>
    </Container>
  );
};
