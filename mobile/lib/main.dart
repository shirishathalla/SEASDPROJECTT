import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/theme/vault_theme.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(const ProviderScope(child: DocuVaultMobileApp()));
}

class DocuVaultMobileApp extends StatelessWidget {
  const DocuVaultMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DocuVault',
      debugShowCheckedModeBanner: false,
      theme: VaultTheme.darkTheme,
      home: const Scaffold(
        body: Center(
          child: Text(
            'DocuVault — AI-Powered Privacy-First Document Wallet',
            style: TextStyle(color: VaultTheme.white),
          ),
        ),
      ),
    );
  }
}
