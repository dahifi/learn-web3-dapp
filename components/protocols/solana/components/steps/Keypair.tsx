import {Alert, Button, Col, Space, Typography, Modal} from 'antd';
import type {ErrorT} from '@solana/types';
import {ErrorBox} from '@solana/components/nav';
import {useEffect, useState} from 'react';
import {prettyError} from '@solana/lib';
import {useGlobalState} from 'context';
import axios from 'axios';

const {Text} = Typography;

const Keypair = () => {
  const {state: globalState, dispatch} = useGlobalState();
  const state = globalState.solana;
  const [address, setAddress] = useState<string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);
  const [error, setError] = useState<ErrorT | null>(null);

  useEffect(() => {
    if (error) {
      errorMsg(error);
    }
  }, [error, setError]);

  function errorMsg(error: ErrorT) {
    Modal.error({
      title: 'Unable to connect',
      content: <ErrorBox error={error} />,
      afterClose: () => setError(null),
      width: '800px',
    });
  }
  useEffect(() => {
    if (state?.address) {
      setAddress(state.address);
    }
  }, []);

  const generateKeypair = async () => {
    setFetching(true);
    try {
      const response = await axios.get(`/api/solana/keypair`);
      setAddress(response.data.address);
      dispatch({
        type: 'SetSolanaSecret',
        secret: response.data.secret,
      });
      dispatch({
        type: 'SetSolanaAddress',
        address: response.data.address,
      });
    } catch (error) {
      setError(prettyError(error));
    } finally {
      setFetching(false);
    }
  };

  return (
    <Col>
      <Space direction="vertical">
        <Button
          type="primary"
          onClick={generateKeypair}
          style={{marginBottom: '20px'}}
          loading={fetching}
        >
          Generate Keypair
        </Button>
        {address ? (
          <Alert
            message={
              <Space>
                <Text strong>Keypair generated!</Text>
              </Space>
            }
            description={
              <div>
                <div>
                  This is the string representation of the public key <br />
                  <Text code>{address}</Text>
                </div>
                <Text>
                  Accessible (and copyable) at the top right of this page.
                </Text>
              </div>
            }
            type="success"
            showIcon
          />
        ) : (
          <Alert message="Please Generate a Keypair" type="error" showIcon />
        )}
      </Space>
    </Col>
  );
};

export default Keypair;
