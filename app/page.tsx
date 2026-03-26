"use client";
import React, { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid'; 
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { 
  Container, Typography, TextField, Button, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Paper, Box, IconButton 
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import LanguageIcon from '@mui/icons-material/Language';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';

// استيراد إعدادات الترجمة
import '../i18n'; 
import { useTranslation } from 'react-i18next';

interface Item { id: string; name: string; category: string; }

export default function Home() {
  const { t, i18n } = useTranslation();
  
  // حل مشكلة Hydration: التأكد من أن المكون تم تحميله على المتصفح
  const [mounted, setMounted] = useState(false);
  
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // 1. تفعيل الـ Mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // 2. إدارة اتجاه الصفحة واللغة
  useEffect(() => {
    if (mounted) {
      document.body.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';
    }
  }, [i18n.language, mounted]);

  // 3. إعداد النمط الليلي (Dark Mode)
  const darkTheme = useMemo(() => createTheme({
    palette: { mode: 'dark', primary: { main: '#90caf9' } },
    direction: i18n.language === 'ar' ? 'rtl' : 'ltr',
  }), [i18n.language]);

  // 4. جلب البيانات (API + LocalStorage)
  useEffect(() => {
    if (!mounted) return;

    const loadInitialData = async () => {
      const saved = localStorage.getItem('site_data_v2');
      if (saved) {
        setItems(JSON.parse(saved));
      } else {
        try {
          const response = await fetch('https://jsonplaceholder.typicode.com/users?_limit=5');
          const apiData = await response.json();
          const formattedData: Item[] = apiData.map((user: any) => ({
            id: uuidv4(),
            name: user.name,
            category: user.company.name 
          }));
          setItems(formattedData);
          localStorage.setItem('site_data_v2', JSON.stringify(formattedData));
        } catch (error) {
          console.error("API Fetch Error:", error);
        }
      }
    };
    loadInitialData();
  }, [mounted]);

  // 5. دالة الإضافة أو التحديث
  const handleSubmit = () => {
    if (!name.trim() || !category.trim()) return;

    let updatedItems;
    if (editId) {
      updatedItems = items.map(item => 
        item.id === editId ? { ...item, name: name.trim(), category: category.trim() } : item
      );
      setEditId(null);
    } else {
      const newItem = { id: uuidv4(), name: name.trim(), category: category.trim() };
      updatedItems = [...items, newItem];
    }

    setItems(updatedItems);
    localStorage.setItem('site_data_v2', JSON.stringify(updatedItems));
    setName(''); setCategory('');
  };

  const handleDelete = (id: string) => {
    const filtered = items.filter(item => item.id !== id);
    setItems(filtered);
    localStorage.setItem('site_data_v2', JSON.stringify(filtered));
  };

  const startEdit = (item: Item) => {
    setName(item.name);
    setCategory(item.category);
    setEditId(item.id);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ar' ? 'en' : 'ar');
  };

  // منع الرندرة حتى يكتمل التحميل على المتصفح لتجنب Hydration Mismatch
  if (!mounted) return null;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Container maxWidth="md" sx={{ mt: 5, pb: 5 }}>
        
        {/* زر تبديل اللغة */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button startIcon={<LanguageIcon />} onClick={toggleLanguage} variant="outlined" size="small">
            {t('switchLang')}
          </Button>
        </Box>

        {/* العناوين */}
        <Box textAlign="center" mb={4}>
          <Typography variant="h4" fontWeight="bold" color="primary">{t('title')}</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ opacity: 0.8 }}>{t('subtitle')}</Typography>
        </Box>

        {/* نموذج الإدخال */}
        <Paper elevation={4} sx={{ p: 3, mb: 4, borderRadius: 3, border: editId ? '1px solid #90caf9' : '1px solid rgba(255,255,255,0.1)' }}>
          <Typography variant="h6" mb={2}>{editId ? (i18n.language === 'ar' ? "تعديل السجل" : "Edit Entry") : t('addNew')}</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField 
              label={t('nameLabel')} 
              size="small" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              sx={{ flex: 1 }} 
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <TextField 
              label={t('categoryLabel')} 
              size="small" 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              sx={{ flex: 1 }} 
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            />
            <Button 
              variant="contained" 
              startIcon={editId ? <SaveIcon /> : <AddCircleOutlineIcon />} 
              onClick={handleSubmit}
              color={editId ? "success" : "primary"}
              disableElevation
            >
              {editId ? (i18n.language === 'ar' ? "حفظ" : "Save") : t('addButton')}
            </Button>
            {editId && <Button color="inherit" onClick={() => {setEditId(null); setName(''); setCategory('');}}>{i18n.language === 'ar' ? "إلغاء" : "Cancel"}</Button>}
          </Box>
        </Paper>

        {/* جدول البيانات */}
        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'rgba(255,255,255,0.05)' }}>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('idCol')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('nameCol')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('catCol')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }} align="center">{i18n.language === 'ar' ? "الإجراءات" : "Actions"}</TableCell>
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
                  <TableCell align="center">
                    <IconButton color="info" onClick={() => startEdit(item)} size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(item.id)} size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
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