export const GetVerifyURL = ({
    token, 
    identifier
} : {
    token: string,
    identifier: string
}) => {
  const baseURL = process.env.NEXT_PUBLIC_APP_URL;
  return `${baseURL}/verify?token=${token}&identifier=${encodeURIComponent(identifier)}`;
};
