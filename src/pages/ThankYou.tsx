import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

const ThankYou = () => {
  const { eventId } = useParams<{ eventId: string }>();

  return (
    <div className="min-h-screen flex items-center justify-center px-6 animate-fade-in">
      <div className="text-center space-y-8 max-w-sm">
        <div className="flex justify-center">
          <Heart className="h-10 w-10 text-primary" strokeWidth={1.5} />
        </div>
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold text-foreground font-serif">Thank you</h1>
          <p className="text-muted-foreground">
            Your contribution has been received. The birthday star is going to love their gift.
          </p>
        </div>
        <Link to={`/party/${eventId}`}>
          <Button variant="outline">Back to party page</Button>
        </Link>
      </div>
    </div>
  );
};

export default ThankYou;
