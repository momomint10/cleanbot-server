const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
 
const app = express();
app.use(cors());
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ limit: '20mb', extended: true }));
 
// Supabase ì°ê²°
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);
 
// ââ ìë² ìí íì¸ ââââââââââââââââââââââââââââââ
app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'ì¹ì¹ ìë² ì ì ìë ì¤ ð§¹',
    version: '1.0.0'
  });
});
 
// ââ êµ¬ëì ì¬ì  ì ì²­ ââââââââââââââââââââââââââââ
// ëë©íì´ì§ìì ì¬ì  ì ì²­ ì í¸ì¶
app.post('/api/subscribe', async (req, res) => {
  const { company_name, phone, email, plan } = req.body;
 
  if (!company_name || !phone) {
    return res.status(400).json({ error: 'ìì²´ëªê³¼ ì°ë½ì²ë íììëë¤' });
  }
 
  try {
    // ì¤ë³µ ì²´í¬
    const { data: existing } = await supabase
      .from('subscribers')
      .select('id')
      .eq('phone', phone)
      .single();
 
    if (existing) {
      return res.json({ success: true, message: 'ì´ë¯¸ ì ì²­íì¨ìµëë¤!', duplicate: true });
    }
 
    // êµ¬ëì ì ì¥
    const { data: subscriber, error } = await supabase
      .from('subscribers')
      .insert([{
        company_name,
        phone,
        email: email || null,
        plan: plan || 'standard',
        status: 'pending',
      }])
      .select()
      .single();
 
    if (error) throw error;
 
    // ê¸°ë³¸ ìì²´ ì¤ì  ìë ìì±
    await supabase
      .from('business_settings')
      .insert([{
        subscriber_id: subscriber.id,
        company_name,
        phone,
        greeting: `ìëíì¸ì! ð ${company_name} ìì£¼ì²­ì ì ë¬¸íìëë¤.`,
      }]);
 
    res.json({
      success: true,
      message: 'ì ì²­ì´ ìë£ëììµëë¤! ì¶ì ì ì°ë½ëë¦´ê²ì ð',
      id: subscriber.id
    });
 
  } catch (err) {
    console.error('êµ¬ë ì ì²­ ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥ê° ë°ìíìµëë¤' });
  }
});
 
// ââ êµ¬ëì ëª©ë¡ ì¡°í (ê´ë¦¬ìì©) âââââââââââââââââ
app.get('/api/subscribers', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
  }
 
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('*')
      .order('created_at', { ascending: false });
 
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
 
  } catch (err) {
    console.error('êµ¬ëì ì¡°í ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ êµ¬ëì ìí ë³ê²½ (ê´ë¦¬ìì©) âââââââââââââââââ
app.put('/api/subscribers/:id/status', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
  }
 
  const { id } = req.params;
  const { status } = req.body;
 
  const validStatuses = ['pending', 'active', 'paused', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'ì í¨íì§ ìì ìíê°ìëë¤' });
  }
 
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('ìí ë³ê²½ ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ ìì²´ ì¤ì  ì¡°í âââââââââââââââââââââââââââââââ
app.get('/api/settings/:id', async (req, res) => {
  const { id } = req.params;
 
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('subscriber_id', id)
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('ì¤ì  ì¡°í ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ ìì²´ ì¤ì  ìë°ì´í¸ âââââââââââââââââââââââââââ
app.put('/api/settings/:id', async (req, res) => {
  const { id } = req.params;
  const settings = req.body;
 
  try {
    const { data, error } = await supabase
      .from('business_settings')
      .update(settings)
      .eq('subscriber_id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    console.error('ì¤ì  ìë°ì´í¸ ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ ì¸ë ¥ í ëª©ë¡ ì¡°í âââââââââââââââââââââââââââ
app.get('/api/workforce', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('subscribers')
      .select('id, company_name, phone, plan, status, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: false });
 
    if (error) throw error;
    res.json({ success: true, count: data.length, data });
 
  } catch (err) {
    console.error('ì¸ë ¥ í ì¡°í ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ íµê³ (ê´ë¦¬ìì©) ââââââââââââââââââââââââââââââ
app.get('/api/stats', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
  }
 
  try {
    const { data: all } = await supabase.from('subscribers').select('status, plan');
 
    const stats = {
      total: all.length,
      pending: all.filter(s => s.status === 'pending').length,
      active: all.filter(s => s.status === 'active').length,
      by_plan: {
        basic: all.filter(s => s.plan === 'basic').length,
        standard: all.filter(s => s.plan === 'standard').length,
        premium: all.filter(s => s.plan === 'premium').length,
      }
    };
 
    res.json({ success: true, stats });
 
  } catch (err) {
    console.error('íµê³ ì¡°í ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ SMS ë°ì¡ (CoolSMS) ââââââââââââââââââââââââ
app.post('/api/sms/send', async (req, res) => {
  const { to, msg, subject } = req.body;
 
  // íê²½ë³ììì API í¤ ë¡ë (ì¬ì©ììê² ë¸ì¶ ì ë¨)
  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const from = process.env.COOLSMS_FROM;
 
  if (!apiKey || !apiSecret || !from) {
    return res.status(500).json({ error: 'SMS APIê° ì¤ì ëì§ ìììµëë¤.' });
  }
  if (!to || !msg) {
    return res.status(400).json({ error: 'ìì ë²í¸ì ë©ìì§ë íììëë¤' });
  }
 
  try {
    const crypto = require('crypto');
    const date = new Date().toISOString();
    const salt = Math.random().toString(36).substring(2, 12);
    const signature = crypto
      .createHmac('sha256', apiSecret)
      .update(date + salt)
      .digest('hex');
 
    const msgType = Buffer.byteLength(msg, 'utf8') > 90 ? 'LMS' : 'SMS';
 
    const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
      },
      body: JSON.stringify({
        message: {
          to: to.replace(/-/g, ''),
          from: from.replace(/-/g, ''),
          text: msg,
          type: msgType,
          // LMS: ì ë¬ë°ì subject ì¬ì© (ìì¼ë©´ ê³µë°± ëì  ê¸°ë³¸ê°)
          // subjectê° ëªìì ì¼ë¡ ì¤ì ëë©´ CoolSMSê° ì²« ì¤ ìëì¶ì¶ ì í¨
          ...(msgType === 'LMS' ? { subject: (subject && subject.trim()) ? subject.trim().slice(0,20) : '[ìíë¡í´ë¦°] ë¬¸ì' } : {})
        }
      })
    });
 
    const data = await response.json();
 
    if (response.ok) {
      console.log(`SMS ë°ì¡ ìë£: ${to} (${msgType})`);
      res.json({ success: true, message: 'ë°ì¡ ìë£', type: msgType });
    } else {
      console.error('SMS ë°ì¡ ì¤í¨:', data);
      res.status(400).json({ error: data.errorMessage || 'ë°ì¡ ì¤í¨' });
    }
 
  } catch (err) {
    console.error('SMS ë°ì¡ ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥ê° ë°ìíìµëë¤' });
  }
});
 
// ââ SMS ë°ì¡ ê³µíµ í¨ì âââââââââââââââââââââââââââ
// subject ë¯¸ì¤ì  ì CoolSMSê° ë³¸ë¬¸ ì²« ì¤ì ìë ì¶ì¶ â [Webë°ì ] ìë¤ ì¤ë³µ ìì¸
async function sendSMSUtil(to, msg, subject) {
  const apiKey = process.env.COOLSMS_API_KEY;
  const apiSecret = process.env.COOLSMS_API_SECRET;
  const from = process.env.COOLSMS_FROM;
  if (!apiKey || !apiSecret || !from) return { ok: false, error: 'SMS API ë¯¸ì¤ì ' };
 
  const crypto = require('crypto');
  const date = new Date().toISOString();
  const salt = Math.random().toString(36).substring(2, 12);
  const signature = crypto.createHmac('sha256', apiSecret).update(date + salt).digest('hex');
  const msgType = Buffer.byteLength(msg, 'utf8') > 90 ? 'LMS' : 'SMS';
 
  // LMSì¼ ëë§ subject í¬í¨ (subject ìì¼ë©´ ë³¸ë¬¸ ì²«ì¤ì´ ì ëª©ì¼ë¡ ìë ì¶ì¶ë¨)
  const msgObj = { to: to.replace(/-/g,''), from: from.replace(/-/g,''), text: msg, type: msgType };
  if (msgType === 'LMS' && subject) msgObj.subject = subject.slice(0, 20);
 
  const response = await fetch('https://api.coolsms.co.kr/messages/v4/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `HMAC-SHA256 apiKey=${apiKey}, date=${date}, salt=${salt}, signature=${signature}`
    },
    body: JSON.stringify({ message: msgObj })
  });
  return response.ok ? { ok: true } : { ok: false, error: (await response.json()).errorMessage };
}
 
// ââ ê³ì½ì PDF ìë¡ë & SMS ë°ì¡ âââââââââââââââââ
app.post('/api/contract/upload', async (req, res) => {
  const { pdfBase64, customerPhone, ownerPhone, customerName, companyName, companyPhone } = req.body;
 
  if (!pdfBase64 || !customerPhone) {
    return res.status(400).json({ error: 'íì ë°ì´í°ê° ììµëë¤' });
  }
 
  try {
    // base64 â Buffer ë³í
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    const timestamp = Date.now();
    const fileName = `${timestamp}_${customerPhone.replace(/-/g,'')}.pdf`;
    const filePath = `contracts/${fileName}`;
 
    // Supabase Storage ìë¡ë
    const { error: uploadError } = await supabase.storage
      .from('ssak-contracts')
      .upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
 
    if (uploadError) throw uploadError;
 
    // Public URL ìì±
    const { data: urlData } = supabase.storage
      .from('ssak-contracts')
      .getPublicUrl(filePath);
 
    const pdfUrl = urlData.publicUrl;
 
    // ê³ì½ì SMS ë¬¸êµ¬
    const customerMsg = `ð [${companyName||'ìíë¡í´ë¦°'}] ê³ì½ì ìë´\n${customerName}ë, ê³ì½ìê° ìì±ëììµëë¤.\n\nìë ë§í¬ìì íì¸ ë° ë³´ê´íì¸ì:\n${pdfUrl}\n\në¬¸ì: ${companyPhone||''}`;
    const ownerMsg = `ð ê³ì½ì ì²´ê²° ìë£\nê³ ê°: ${customerName}ë (${customerPhone})\n\nê³ì½ì ë§í¬:\n${pdfUrl}`;
 
    // ê³ ê° SMS ë°ì¡
    await sendSMSUtil(customerPhone, customerMsg);
 
    // ì¬ì¥ë SMS ë°ì¡ (ë²í¸ê° ìê³  ê³ ê°ê³¼ ë¤ë¥¼ ë)
    if (ownerPhone && ownerPhone.replace(/-/g,'') !== customerPhone.replace(/-/g,'')) {
      await sendSMSUtil(ownerPhone, ownerMsg);
    }
 
    console.log(`ê³ì½ì ìë¡ë ìë£: ${filePath}`);
    res.json({ success: true, pdfUrl });
 
  } catch (err) {
    console.error('ê³ì½ì ìë¡ë ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥: ' + err.message });
  }
});
 
// ââ ë¹ëë©´ ê³ì½ì: ì ì¥ & ìëªë§í¬ ë°ì¡ ââââââââââââââ
app.post('/api/contract/create', async (req, res) => {
  const { contractData, ownerSignature, ownerPhone, customerPhone, customerName, companyName, companyPhone } = req.body;
  if (!contractData || !customerPhone) {
    return res.status(400).json({ error: 'íì ë°ì´í°ê° ììµëë¤' });
  }
  try {
    const crypto = require('crypto');
    const token = crypto.randomBytes(20).toString('hex');
 
    const { error } = await supabase.from('pending_contracts').insert([{
      token,
      contract_data: contractData,
      owner_signature: ownerSignature || null,
      status: 'pending'
    }]);
    if (error) throw error;
 
    const signUrl = `https://ssakapp.co.kr/sign.html?token=${token}`;
    const msg = `[${companyName||'ìíë¡í´ë¦°'}] ê³ì½ì ìëª ìì²­\n\n${customerName||'ê³ ê°'}ë, ìë ë§í¬ìì ê³ì½ì ë´ì©ì íì¸íê³  ìëªí´ ì£¼ì¸ì.\n\n${signUrl}\n\në§í¬ë 7ì¼ê° ì í¨í©ëë¤.\n\në¬¸ì: ${companyPhone||''}`;
 
    await sendSMSUtil(customerPhone.replace(/-/g,''), msg, `[${companyName||'ìíë¡í´ë¦°'}] ê³ì½ì`);
 
    console.log(`ê³ì½ì ìì±: ${token}`);
    res.json({ success: true, token, signUrl });
  } catch (err) {
    console.error('ê³ì½ì ìì± ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥: ' + err.message });
  }
});
 
// ââ ë¹ëë©´ ê³ì½ì: ê³ ê° ì¡°í âââââââââââââââââââââââââ
app.get('/api/contract/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { data, error } = await supabase.from('pending_contracts').select('*').eq('token', token).single();
    if (error || !data) return res.status(404).json({ error: 'ê³ì½ìë¥¼ ì°¾ì ì ììµëë¤' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'ë§ë£ë ê³ì½ììëë¤' });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ââ ë¹ëë©´ ê³ì½ì: ê³ ê° ìëª ìë£ & PDF ìì± ââââââââââââ
app.post('/api/contract/:token/sign', async (req, res) => {
  const { token } = req.params;
  const { customerSignature, pdfBase64 } = req.body;
  if (!customerSignature) return res.status(400).json({ error: 'ìëªì´ ììµëë¤' });
 
  try {
    const { data: contract, error } = await supabase.from('pending_contracts').select('*').eq('token', token).single();
    if (error || !contract) return res.status(404).json({ error: 'ê³ì½ìë¥¼ ì°¾ì ì ììµëë¤' });
    if (contract.status === 'completed') return res.status(400).json({ error: 'ì´ë¯¸ ìëªë ê³ì½ììëë¤' });
 
    const cd = contract.contract_data;
    let pdfUrl = null;
 
    // PDF ìë¡ë
    if (pdfBase64) {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');
      const fileName = `${Date.now()}_${token.slice(0,8)}.pdf`;
      const filePath = `contracts/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('ssak-contracts').upload(filePath, pdfBuffer, { contentType: 'application/pdf', upsert: true });
      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('ssak-contracts').getPublicUrl(filePath);
        pdfUrl = urlData.publicUrl;
      }
    }
 
    // ìí ìë°ì´í¸
    await supabase.from('pending_contracts').update({
      customer_signature: customerSignature,
      status: 'completed',
      pdf_url: pdfUrl
    }).eq('token', token);
 
    // ìì¸¡ SMS ë°ì¡
    const companyName = cd.companyName || 'ìíë¡í´ë¦°';
    const companyPhone = cd.companyPhone || '';
    const customerName = cd.name || 'ê³ ê°';
    const customerPhone = cd.phone || '';
    const linkMsg = pdfUrl ? `\n\nê³ì½ì PDF: ${pdfUrl}` : '';
 
    const customerMsg = `[${companyName}] ê³ì½ì ìëª ìë£!\n${customerName}ëì ìëªì´ ìë£ëììµëë¤.${linkMsg}\n\në¬¸ì: ${companyPhone}`;
    const ownerMsg = `[ê³ì½ì ìëª ìë£]\nê³ ê°: ${customerName}ë (${customerPhone})\nìëªì´ ìë£ëììµëë¤.${linkMsg}`;
 
    if (customerPhone) await sendSMSUtil(customerPhone.replace(/-/g,''), customerMsg, `[${companyName}] ìëª ìë£`);
    if (companyPhone) await sendSMSUtil(companyPhone.replace(/-/g,''), ownerMsg, 'ê³ì½ì ìëª ìë£');
 
    console.log(`ê³ì½ì ìëª ìë£: ${token}`);
    res.json({ success: true, pdfUrl });
  } catch (err) {
    console.error('ìëª ìë£ ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥: ' + err.message });
  }
});
 
// ââ ìì½ ì ì²­ ì ì âââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.post('/api/booking', async (req, res) => {
  try {
    const { name, phone, address, size, type, date, time, notes, price, companyName } = req.body;
    if (!name || !phone || !address) {
      return res.status(400).json({ error: '이름, 연락처, 주소는 필수입니다.' });
    }
    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        name,
        phone: phone.replace(/-/g, ''),
        address,
        size: size ? parseInt(size) : null,
        type: type || '입주 전 청소',
        date: date || null,
        time: time || null,
        notes: notes || null,
        price: price || null,
        company_name: companyName || null,
        status: 'pending',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    if (error) throw error;

    // SMS 알림 (실패해도 예약 등록은 성공 처리)
    try {
      const ownerPhone = process.env.OWNER_PHONE;
      const apiKey = process.env.COOLSMS_API_KEY;
      const apiSecret = process.env.COOLSMS_API_SECRET;
      const fromPhone = process.env.FROM_PHONE;
      if (ownerPhone && apiKey && apiSecret && fromPhone) {
        const crypto = require('crypto');
        const timestamp = new Date().toISOString().replace(/[^0-9]/g,'').slice(0,14);
        const salt = Math.random().toString(36).substr(2,16);
        const signature = crypto.createHmac('sha256', apiSecret).update(timestamp+salt).digest('hex');
        const msg = `[싹싹] 새 예약신청!\n${name}(${phone})\n${date} ${time}\n${type} ${size}평\n${address}`;
        await fetch('https://api.coolsms.co.kr/messages/v4/send', {
          method:'POST',
          headers:{'Content-Type':'application/json','Authorization':`HMAC-SHA256 apiKey=${apiKey}, date=${timestamp}, salt=${salt}, signature=${signature}`},
          body: JSON.stringify({message:{to:ownerPhone,from:fromPhone,text:msg}})
        });
      }
    } catch(smsErr) {
      console.log('SMS 알림 실패(무시):', smsErr.message);
    }

    res.json({ success: true, data });
  } catch (err) {
    console.error('예약 접수 오류:', err);
    res.status(500).json({ error: '서버 오류: ' + err.message });
  }
});

app.get('/api/bookings', async (req, res) => {
  try {
    // x-admin-key 헤더 또는 adminKey 쿼리 파라미터 모두 허용
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: '인증 실패' });
    }
    const { status } = req.query;
    let query = supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (status) query = query.eq('status', status);
    const { data, error } = await query;
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.adminKey;
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(401).json({ error: '인증 실패' });
    }
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('bookings').update({ status }).eq('id', id).select().single();
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/bookings/:id/status', async (req, res) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: 'ì¸ì¦ ì¤í¨' });
  }
 
  const { id } = req.params;
  const { status } = req.body; // pending | confirmed | completed | cancelled
 
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select()
      .single();
 
    if (error) throw error;
    res.json({ success: true, data });
 
  } catch (err) {
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
 
// ââ ìì½ë§í¬ í í° ìì± (URL ë¨ì¶ì©) âââââââââââââââââââââââââââââââââââââââ
// ê²¬ì  ë°ì´í°ë¥¼ ìë²ì ì ì¥ â ì§§ì í í° ë°í â booking.html?t={token}
app.post('/api/booking/token', async (req, res) => {
  const { name, phone, size, type, price, companyName } = req.body;
  try {
    const crypto = require('crypto');
    const token = crypto.randomBytes(6).toString('hex'); // 12ìë¦¬ ì§§ì í í°
 
    const { error } = await supabase.from('booking_tokens').insert([{
      token,
      quote_data: { name, phone, size, type, price, companyName },
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7ì¼ ì í¨
    }]);
    if (error) throw error;
 
    const finalUrl = `https://ssakapp.co.kr/booking.html?t=${token}`;
    res.json({ success: true, url: finalUrl, token });
  } catch (err) {
    console.error('í í° ìì± ì¤ë¥:', err);
    res.status(500).json({ error: 'ìë² ì¤ë¥: ' + err.message });
  }
});
 
// ââ ìì½ë§í¬ í í° ì¡°í ââââââââââââââââââââââââââââââââââââââââââââââââââââââ
app.get('/api/booking/token/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { data, error } = await supabase
      .from('booking_tokens')
      .select('*')
      .eq('token', token)
      .single();
 
    if (error || !data) return res.status(404).json({ error: 'ì í¨íì§ ìì ë§í¬ìëë¤' });
    if (new Date(data.expires_at) < new Date()) return res.status(410).json({ error: 'ë§ë£ë ë§í¬ìëë¤ (7ì¼ ì´ê³¼)' });
 
    res.json({ success: true, data: data.quote_data });
  } catch (err) {
    res.status(500).json({ error: 'ìë² ì¤ë¥' });
  }
});
 
// ìë² ìì
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`â ì¹ì¹ ìë² ì¤í ì¤ - í¬í¸ ${PORT}`);
  console.log(`ð§¹ ì¹ì¹ ìì£¼ì²­ì ì ë¬¸ì¸ íë«í¼`);
});
 
