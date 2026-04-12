import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const ThankYou = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center space-y-6 max-w-sm">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-accent/20 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Thank you! 💝</h1>
        <p className="text-muted-foreground">
          Your contribution has been received. The birthday star is going to love their gift!
        </p>
        <Link to={`/party/${eventId}`}>
          <Button variant="outline">Back to party page</Button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
