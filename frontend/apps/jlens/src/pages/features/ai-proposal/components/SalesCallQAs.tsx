import { aiProposalApi } from "@query/ai-proposal/actions";
import { Download, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function SalesCallQAs({ convId, isUploaded, onUpload }: { convId: string, isUploaded: boolean, onUpload: () => void }) {
return<>
                <div className="flex justify-center">
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div
                      className="border border-primary/30 rounded-lg p-4 flex-1 min-w-[220px] shadow-sm hover:bg-primary/5"
                      onClick={() => {
                        aiProposalApi.downloadSalesCallQuestionsDocx();
                      }}
                    >
                      <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Sales Call Questions
                      </h3>
                      <p className="mt-1 text-xs text-primary/70">
                        Get the list of questions for your sales calls.
                      </p>
                    </div>
                    <div
                      className="border border-primary/30 rounded-lg p-4 flex-1 min-w-[220px] shadow-sm hover:bg-primary/5 cursor-pointer relative"
                      onClick={() => {
                        if (!convId) {
                          toast.error("Conversation not found.");
                          return;
                        }
                        document.getElementById("sales-call-upload-input")?.click();
                      }}
                    >
                      <h3 className="text-sm font-semibold text-primary flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Upload Sales Call Questions
                      </h3>
                      <p className="mt-1 text-xs text-primary/70">
                        Upload the answered sales call questions here
                      </p>
                      {/* Status Icon */}
                      <span className="absolute top-3 right-3">
                        {!isUploaded ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )}
                      </span>
                      <input
                        id="sales-call-upload-input"
                        type="file"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (!convId) {
                            toast.error("Conversation not found.");
                            return;
                          }
                          if (isUploaded) {

                            const result = confirm("Previously uploaded file will be overriden. Do you want to continue?");

                            if (!result) {
                                return;
                            }
                            
                        }
                          toast.loading("Uploading...");
                          try {
                            const res = await aiProposalApi.uploadSalesCallQAs(convId, file);
                            toast.dismiss();
                            if (res.message) {
                                toast.success("File uploaded successfully");
                                onUpload();
                            } else {
                                toast.error("File upload unsuccessful");
                            }
                          } catch (err) {
                            toast.dismiss();
                            toast.error("File upload failed");
                          }
                          // Reset input value so user can re-upload same file if needed
                          e.target.value = "";
                        }}
                      />
                    </div>
                  </div>
                </div>
</>
}