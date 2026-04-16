// Notification utility for playing sounds
export const playNotificationSound = (type: 'message' | 'reply' | 'admin_reply' | 'alert' = 'message') => {
  try {
    // Use Web Audio API to create a simple notification sound
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Different frequencies for different notification types
    const frequencies: Record<string, number[]> = {
      message: [800, 600], // Two beeps for messages
      reply: [1000, 800, 600], // Three beeps for client replies
      admin_reply: [1200, 1000, 800], // Three high beeps for admin replies
      alert: [1200, 1000, 800], // Three high beeps for alerts
    };

    const freqs = frequencies[type] || frequencies.message;
    const duration = 0.15; // Duration of each beep in seconds - increased from 0.1

    let currentTime = audioContext.currentTime;
    for (const freq of freqs) {
      oscillator.frequency.setValueAtTime(freq, currentTime);
      // Increased volume from 0.3 to 0.6
      gainNode.gain.setValueAtTime(0.6, currentTime);
      gainNode.gain.linearRampToValueAtTime(0, currentTime + duration);
      currentTime += duration + 0.15; // Add gap between beeps
    }

    oscillator.start(audioContext.currentTime);
    oscillator.stop(currentTime);
    
    console.log(`Playing ${type} notification sound`);
  } catch (error) {
    console.error('Error playing notification sound:', error);
    // Fallback: Use browser's built-in beep if Web Audio API fails
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==');
      audio.volume = 1; // Set to max volume
      audio.play().catch(() => {
        console.log('Could not play fallback audio');
      });
    } catch (e) {
      // Fallback failed as well
      console.error('Fallback audio also failed:', e);
    }
  }
};

// Send notification to admin via Supabase real-time
export const sendRealtimeNotification = async (
  supabase: any,
  adminId: string,
  clientName: string,
  replyId: string,
  type: 'client_reply' | 'new_message' = 'client_reply'
) => {
  try {
    // Send notification via Supabase
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        admin_id: adminId,
        type,
        title: type === 'client_reply' ? 'New Reply from Client' : 'New Message',
        message: type === 'client_reply' 
          ? `${clientName} replied to your message`
          : `New message from ${clientName}`,
        related_id: replyId,
        is_read: false,
      });

    if (error) {
      console.error('Error sending notification:', error);
    }

    return data;
  } catch (error) {
    console.error('Error in sendRealtimeNotification:', error);
  }
};
