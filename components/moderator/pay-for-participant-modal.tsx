"use client"

import { CreatePaymentForParticipationByID } from "@/actions/stripe";
import { formatedDate } from "@/utils/date";
import { ModeratorQueries, PaymentQueries } from "@/utils/query";
import { faRotate, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Alert,
  Button,
  Form,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Tooltip,
  addToast,
  useDisclosure
} from "@heroui/react";
import { Country, Meeting, Participation, User } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";

import Loader from "../loader";
import { stripePromise } from "@/lib/stripe-client";
import { useTheme } from "next-themes";
import { PaymentIntent } from "@stripe/stripe-js";
import { useEffect } from "react";

export const PayForParticipantModal = ({
  participation,
  user,
  meeting,
  country,
} : {
  participation: Pick<Participation, "id" | "amountPaid" | "meetingId">;
  meeting: Meeting;
  country: Country;
  user: Pick<User, "name">;
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <main>
      <Tooltip
        color="warning"
        placement="top"
        content="Opłać spotkanie"
        className="text-white"
      >
        <Button
          color="warning"
          isIconOnly
          onPress={onOpen}
          variant="light"
          radius="full"
          isDisabled={participation.amountPaid >= meeting.price}
        >
          <FontAwesomeIcon icon={faSackDollar} size="xl" />
        </Button>
      </Tooltip>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        placement="center"
        scrollBehavior="outside"
        size="xl"
      >
        <ModalContent>
          <ModalHeader>Opłać spotkanie</ModalHeader>
          <PayForParticipantForm
            participation={participation}
            meeting={meeting}
            country={country}
            user={user}
            onClose={onClose}
          />
        </ModalContent>
      </Modal>
    </main>
  );
};

const PayForParticipantForm = ({
  participation,
  meeting,
  country,
  user,
  onClose,
} : {
  participation: Pick<Participation, "id" | "meetingId">;
  meeting: Meeting;
  country: Country;
  user: Pick<User, "name">;
  onClose: () => void;
}) => {
  const { resolvedTheme } = useTheme();
  
  // tworzymy płatność Stripe (Connect) — backend zwraca client_secret
  const stripeQuery = useQuery({
    queryKey: [PaymentQueries.Participation, participation.id],
    queryFn: () => CreatePaymentForParticipationByID(participation.id),
  });

  const theme: "night" | "stripe" = resolvedTheme === "dark" ? "night" : "stripe";
  const appearance = {
    theme,
    variables: {
      colorPrimary: resolvedTheme === "dark" ? "#facc15" : "#f59e0b",
    },
  };

  useEffect(() => {
    if (stripeQuery.data === null) {
      onClose();
    }
  }, [stripeQuery.data, onClose]);

  return (
    <ModalBody>
      <div className="mb-4">
        Czy jesteś pewien, że chcesz opłacić spotkanie z dnia{" "}
        <strong>
          {formatedDate(
            meeting.startTime,
            meeting.endTime,
            country.timeZone,
            "onlyDays",
            country.locale
          )}
        </strong>{" "}
        dla kręgowca <strong>{user.name}</strong>?
      </div>

      {stripeQuery.isLoading && <Loader />}
      {stripeQuery.isError && (
        <Alert
          color="danger"
          title="Nie udało się wygenerować płatności."
          endContent={
            <Button
              color="danger"
              startContent={<FontAwesomeIcon icon={faRotate} />}
              onPress={() => stripeQuery.refetch()}
            >
              Odśwież
            </Button>
          }
        />
      )}
      {stripeQuery.data && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: stripeQuery.data.client_secret,
            appearance,
          }}
        >
          <StripeCheckoutForm
            payment={stripeQuery.data}
            participation={participation}
            onClose={onClose}
          />
        </Elements>
      )}
    </ModalBody>
  );
};

const StripeCheckoutForm = ({
  payment,
  participation,
  onClose,
}: {
  payment: Pick<
    PaymentIntent,
    "id" | "status" | "currency" | "amount" | "client_secret"
  >;
  participation: Pick<Participation, "meetingId">;
  onClose: () => void;
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      if (!stripe || !elements) throw new Error("Stripe not loaded");

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: "", // unikamy redirectu
        },
        redirect: "if_required",
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.paymentIntent;
    },
    onSuccess: () => {
      addToast({
        title: "Płatność udana",
        color: "success",
      });
      queryClient.invalidateQueries({
        queryKey: [ModeratorQueries.MeetingParticipants, participation.meetingId],
      });
      onClose();
    },
    onError: (error) => {
      addToast({
        title: error.message || "Błąd płatności",
        color: "danger",
      });
    },
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
    >
      <PaymentElement className="w-full" options={{ layout: "tabs" }} />
      <Button
        radius="sm"
        color="success"
        type="submit"
        fullWidth
        className="mt-4 text-white"
        startContent={<FontAwesomeIcon icon={faSackDollar} />}
        isDisabled={mutation.isPending || !stripe || !elements || !payment}
        isLoading={mutation.isPending}
      >
        {mutation.isPending
          ? "Przetwarzanie..."
          : `Zapłać ${payment.amount / 100} ${payment.currency.toUpperCase()}`}
      </Button>
    </Form>
  );
};