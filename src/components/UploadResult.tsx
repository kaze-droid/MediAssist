import {
    Alert,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert"
import Link from "next/link"
import { Tick, Cross } from "@/components/SVGIcon"
import { Button } from "@/components/ui/button"
import { insertDrugs, insertCustDrugs, getDrugDetails, getDrugPID, getUserPID } from '@/app/api/api'
import { useAuth } from "@clerk/nextjs"

type UploadProps = {
    error: boolean,
    text: { "Header": string, "Content"?: string },
    display: boolean,
    className?: string
}


const UploadResult = ({ error, text, display, className }: UploadProps) => {

    const { isLoaded, userId, isSignedIn } = useAuth();

    if (!isLoaded || !isSignedIn || !userId) {
        // You can handle the loading or signed state separately
        return null;
    }

    const id = text.Header.split(" ")[1];

    const handleClick = async () => {
        if (error) {
            return;
        }

        // Part 1: Get Drug Details from API using ID
        let res;
        try {
            res = await getDrugDetails(id);
        } catch (err) {
            return;
        }

        // Part 2: Get Unique Drug ID from Database
        let drugPID;
        try {
            drugPID = await getDrugPID(id);
        } catch (err) {
            // Part 3: If Drug doesn't exist in database, insert it
            await insertDrugs(id, res.genName, res.summary);
            drugPID = await getDrugPID(id);
        }

        // Part 4: Get Unique Customer ID from Database
        let customerPID;
        try {
            customerPID = await getUserPID(userId);
        } catch (err) {
            return;
        }

        // Part 5: Insert into Customer-Drug Table if it doesn't exist
        try {
            await insertCustDrugs(customerPID.id, drugPID.id);
        } catch (err) {
            return;
        }
    }

    return (
        <div className={`w-96 ${display ? "visible" : "hidden"}`}>
            <Alert>
                <div className={`flex justify-between items-center ${className}`}>
                    <div className='flex'>
                        <div className="flex flex-col justify-center p-3">
                            {error ? <Cross /> : <Tick />}
                        </div>

                        <div>
                            <AlertTitle>{text.Header}</AlertTitle>
                            <AlertDescription>
                                <p>{text.Content}</p>
                                <Link href={`/info/${id}`} className={`${error ? 'hidden' : 'display'}`}>
                                    View More Details
                                </Link>
                            </AlertDescription>
                        </div>
                    </div>
                    <Button variant="medical" size="icon" className={`${error ? 'hidden' : 'display'}`} onClick={handleClick}>
                        <div className="flex flex-col justify-center items-center">
                            <span className="bg-white h-0.5 w-5 rounded-sm translate-y-[0.2rem] p-0.5"></span>
                            <span className="bg-white h-0.5 w-5 rounded-sm rotate-90  p-0.5"></span>
                        </div>
                    </Button>
                </div>
            </Alert>
        </div>
    )
}

export default UploadResult