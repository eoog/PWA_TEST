import {useEffect, useState} from "react";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {Separator} from "@/components/ui/separator";
import {Input} from "@/components/ui/input";
import {X} from "lucide-react";


const EXTENSION_IDENTIFIER = 'URL_HISTORY_TRACKER_f7e8d9c6b5a4';

export default function MoveTabsToWindow() {
    const [urls, setUrls] = useState<string[]>([]);
    const [inputUrl, setInputUrl] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleAddUrl = () => {
        if (!inputUrl.trim()) {
            setError("URL을 입력해주세요.");
            return;
        }

        if (urls.includes(inputUrl.trim())) {
            setError("이미 추가된 URL입니다.");
            return;
        }

        setUrls(prev => {
            const newUrls = [...prev, inputUrl.trim()];
            setUrls(newUrls);
            return newUrls;
        });
        setInputUrl("");
        setError("");
    };

    const handleRemoveUrl = (indexToRemove: number) => {
        setUrls(prev => {
            const newUrls = prev.filter((_, index) => index !== indexToRemove);
            setUrls(newUrls);
            return newUrls;
        });
    };

    const requestMoveTabsToWindow = () => {
        if (urls.length === 0) {
            setMessage("이동할 URL을 하나 이상 추가해주세요.");
            setStatus("error");
            return;
        }

        window.postMessage({
            type: "REQUEST_MOVE_TABS_BY_URLS",
            identifier: EXTENSION_IDENTIFIER,
            urls: urls
        }, "*");
    };

    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === "RESPONSE_MOVE_TABS_BY_URLS" &&
                event.data.source === EXTENSION_IDENTIFIER) {
                const response = event.data.data;
                if (response.success) {
                    setMessage(`${response.movedTabs}개의 탭이 새 창으로 이동되었습니다.`);
                    setStatus("success");
                } else {
                    setMessage(response.message || "탭 이동에 실패했습니다.");
                    setStatus("error");
                }
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, []);

    return (
        <div className="flex min-h-0 flex-1 gap-4 m-4 overflow-auto w-full min-w-0 flex-col">
            <Card>
                <CardHeader>
                    <CardTitle>탭 이동</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-2">
                            <Input
                                value={inputUrl}
                                onChange={(e) => setInputUrl(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddUrl()}
                                placeholder="URL을 입력하세요 (예: github.com)"
                            />
                            <Button onClick={handleAddUrl}>추가</Button>
                        </div>

                        {urls.length > 0 && (
                            <div className="flex flex-col gap-2">
                                {urls.map((url, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center justify-between p-2 rounded border"
                                    >
                                        <span className="truncate flex-1 mr-2">{url}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleRemoveUrl(index)}
                                        >
                                            <X className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Separator orientation="horizontal" className="w-full"/>
                    <Button
                        onClick={requestMoveTabsToWindow}
                        disabled={urls.length === 0}
                    >
                        선택한 URL의 탭을 새 창으로 이동 ({urls.length})
                    </Button>

                    {message && (
                        <Alert variant={status === "success" ? "default" : "destructive"}>
                            <AlertDescription>{message}</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}