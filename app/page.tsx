"use client";
import  { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Box, Divider 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LanguageIcon from '@mui/icons-material/Language';

// استيراد الإعدادات من الملف الذي أنشأته في الخطوة السابقة
import '../i18n'; 
import { useTranslation } from 'react-i18next';

interface Item { id: string; name: string; category: string; }

export default function Home() {
  const { t, i18n } = useTranslation();
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');

  // 1. تحديث دالة جلب البيانات داخل المكون
  useEffect(() => {
    const loadInitialData = async () => {
      const saved = localStorage.getItem('site_data');
      
      if (saved) {
        // إذا وجدت بيانات مخزنة، استخدمها
        setItems(JSON.parse(saved));
      } else {
        // إذا كان التطبيق يعمل لأول مرة، اسحب بيانات من API خارجي
        try {
          const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
          const apiData = await response.json();
          
          // تحويل بيانات الـ API لتناسب هيكل مشروعك (UUID + Name + Category)
          const formattedData: Item[] = apiData.map((user: any) => ({
            id: uuidv4(),
            name: user.name,
            category: user.company.name // سنستخدم اسم الشركة كفئة تجريبية
          }));

          setItems(formattedData);
          localStorage.setItem('site_data', JSON.stringify(formattedData));
        } catch (error) {
          console.error("Failed to fetch API data:", error);
        }
      }
    };

    loadInitialData();
  }, []);

  // ضبط اتجاه الصفحة (RTL/LTR)
  useEffect(() => {
    document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
  }, [i18n.language]);

  const darkTheme = useMemo(() => createTheme({
    palette: { mode: 'dark', primary: { main: '#90caf9' } },
    direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
  }), [i18n.language]);

  useEffect(() => {
    const saved = localStorage.getItem('site_data');
    if (saved) setItems(JSON.parse(saved));
  }, []);

  const handleAdd = () => {
    if (!name.trim() || !category.trim()) return;
    const newItem = { id: uuidv4(), name, category };
    const updated = [...items, newItem];
    setItems(updated);
    localStorage.setItem('site_data', JSON.stringify(updated));
    setName(''); setCategory('');
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 5, pb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<LanguageIcon />} onClick={toggleLanguage} variant="outlined" size="small">
            {t('switchLang')}
          </Button>
        </Box>

        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">{t('title')}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>{t('subtitle')}</Typography>
        </Box>

        <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" mb={2}>{t('addNew')}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField label={t('nameLabel')} size="small" value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1 }} />
            <TextField label={t('categoryLabel')} size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ flex: 1 }} />
            <Button variant="contained" startIcon={<AddCircleOutlineIcon />} onClick={handleAdd} disableElevation sx={{ fontWeight: 'bold' }}>
              {t('addButton')}
            </Button>
          </Box>
        </Paper>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('idCol')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('nameCol')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('catCol')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.length > 0 ? items.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'text.secondary' }}>
                    {item.id.substring(0, 8)}...
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.category}</TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {t('noData')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </ThemeProvider>
  );
}