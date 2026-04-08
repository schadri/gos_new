import { MercadoPagoConfig, PreApproval } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: 'TEST-7445411565712029-040818-00a19ae29ce89b32f7e4c2f35d2bef54-327215074' });
const preApproval = new PreApproval(client);

async function run() {
  try {
    const result = await preApproval.create({
      body: {
        reason: 'Suscripcion Test',
        external_reference: 'user_123___pack-10',
        payer_email: 'test_user_123456@testuser.com',
        auto_recurring: {
          frequency: 1,
          frequency_type: 'months',
          transaction_amount: 1000,
          currency_id: 'ARS'
        },
        back_url: 'https://localhost:3000',
        status: 'pending'
      }
    });
    console.log("SUCCESS:", result.init_point);
  } catch(e) {
    console.error("ERROR:", e);
  }
}
run();
