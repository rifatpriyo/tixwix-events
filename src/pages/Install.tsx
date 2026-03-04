import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, WifiOff, Zap, Shield } from "lucide-react";
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  const features = [
    { icon: Zap, title: "Lightning Fast", desc: "Loads instantly, even on slow connections" },
    { icon: WifiOff, title: "Works Offline", desc: "Browse events even without internet" },
    { icon: Smartphone, title: "Native Feel", desc: "Full-screen experience like a real app" },
    { icon: Shield, title: "Always Updated", desc: "Get the latest features automatically" },
  ];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* Hero */}
          <div className="space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-primary flex items-center justify-center cinema-glow">
              <Download className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl md:text-5xl font-display font-bold text-gradient-gold">
              Install TixWix
            </h1>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              Add TixWix to your home screen for the best experience — fast, offline-ready, and always at your fingertips.
            </p>
          </div>

          {/* Install CTA */}
          {isInstalled ? (
            <div className="glass-card rounded-2xl p-8 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-accent/20 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-accent" />
              </div>
              <h2 className="text-xl font-display font-semibold text-foreground">Already Installed!</h2>
              <p className="text-muted-foreground">TixWix is installed on your device. Enjoy the app!</p>
            </div>
          ) : deferredPrompt ? (
            <Button
              onClick={handleInstall}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-xl cinema-glow"
            >
              <Download className="w-5 h-5 mr-2" />
              Install TixWix App
            </Button>
          ) : (
            <div className="glass-card rounded-2xl p-8 space-y-4">
              <h2 className="text-xl font-display font-semibold text-foreground">How to Install</h2>
              {isIOS ? (
                <div className="text-muted-foreground text-left space-y-3">
                  <p className="font-medium text-foreground">On iPhone / iPad:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Tap the <strong className="text-foreground">Share</strong> button (square with arrow) in Safari</li>
                    <li>Scroll down and tap <strong className="text-foreground">Add to Home Screen</strong></li>
                    <li>Tap <strong className="text-foreground">Add</strong> to confirm</li>
                  </ol>
                </div>
              ) : (
                <div className="text-muted-foreground text-left space-y-3">
                  <p className="font-medium text-foreground">On Android / Desktop:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Tap the <strong className="text-foreground">menu</strong> (three dots) in your browser</li>
                    <li>Tap <strong className="text-foreground">Install app</strong> or <strong className="text-foreground">Add to Home Screen</strong></li>
                    <li>Tap <strong className="text-foreground">Install</strong> to confirm</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            {features.map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-5 text-left space-y-2">
                <f.icon className="w-6 h-6 text-primary" />
                <h3 className="font-semibold text-foreground text-sm">{f.title}</h3>
                <p className="text-muted-foreground text-xs">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Install;
