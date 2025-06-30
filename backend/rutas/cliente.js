const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../Vista/cliente/login/index.html'));
});

router.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, '../Vista/cliente/home/index.html'));
});

router.get('/carrito', (req, res) => {
  res.sendFile(path.join(__dirname, '../Vista/cliente/carrito/carrito.html'));
});

router.get('/ticket', (req, res) => {
  res.sendFile(path.join(__dirname, '../Vista/cliente/ticket/tickets.html'));
});

module.exports = router;