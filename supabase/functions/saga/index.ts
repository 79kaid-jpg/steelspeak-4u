/* SteelSpeak Saga core: dữ liệu + tạo đề theo seed + chấm điểm. Dùng chung cho web (saga-core.js) và máy chủ (supabase/functions/saga). */
(function(root){
var CATS = {
  coat: { n: 'Thép phủ & vật liệu', e: '🧱', d: 'Cấu trúc lớp phủ, vật liệu nền, thuộc tính cơ lý' },
  qual: { n: 'Chất lượng & thử nghiệm', e: '🧪', d: 'Test, khiếu nại, truy xuất nguồn gốc, MTC' },
  nspe: { n: 'NSPE & quy trình', e: '🧭', d: 'Yêu cầu sản phẩm phi tiêu chuẩn, CFT, phê duyệt' },
  colr: { n: 'Pha màu & chạy thử', e: '🎨', d: 'Colour matching, sample, trial run' },
  npd:  { n: 'Phát triển sản phẩm mới', e: '🚀', d: 'NPD từ ý tưởng đến ra mắt' },
  biz:  { n: 'Thương mại & KPI', e: '📈', d: 'Báo giá, giá, thị trường, chỉ số' },
  sys:  { n: 'Hệ thống & dữ liệu', e: '💻', d: 'S/4HANA, AVC, BOM, workflow' },
  talk: { n: 'Mẫu câu họp & email', e: '💬', d: 'Câu giao tiếp dùng ngay' }
};

// [cat, en, vi, example_en, example_vi, (optional) word to blank in cloze]
const RAW = [
/* ---------- Coated steel ---------- */
['coat','substrate','vật liệu nền (thép nền)','The steel substrate determines the grade, thickness and yield strength of the product.','Lớp thép nền quyết định mác thép, chiều dày và giới hạn chảy của sản phẩm.'],
['coat','metallic coating','lớp phủ (mạ) kim loại','The metallic coating is the first line of defence against rust.','Lớp mạ kim loại là tuyến phòng thủ đầu tiên chống gỉ.'],
['coat','galvanised steel (GI)','thép mạ kẽm (GI)','Galvanised steel (GI) is protected by a zinc coating.','Thép mạ kẽm (GI) được bảo vệ bằng lớp phủ kẽm.','galvanised'],
['coat','zinc-aluminium coating (GL)','lớp mạ hợp kim nhôm-kẽm (GL)','A zinc-aluminium coating (GL) protects the steel against corrosion.','Lớp mạ nhôm-kẽm (GL) bảo vệ thép khỏi ăn mòn.','zinc-aluminium'],
['coat','sacrificial layer','lớp bảo vệ hy sinh','Zinc acts as a sacrificial layer, so it still protects the steel when the surface is scratched.','Kẽm đóng vai trò lớp hy sinh nên vẫn bảo vệ thép khi bề mặt bị xước.'],
['coat','chemical treatment','lớp xử lý hóa học (tiền xử lý)','The chemical treatment improves paint adhesion and helps prevent white rust.','Lớp xử lý hóa học cải thiện độ bám sơn và giúp ngăn gỉ trắng.'],
['coat','white rust','gỉ trắng (ăn mòn kẽm)','White rust can appear on zinc surfaces that are stored in damp conditions.','Gỉ trắng có thể xuất hiện trên bề mặt kẽm khi lưu kho nơi ẩm ướt.'],
['coat','primer','sơn lót','The primer bonds the paint to the metal and adds flexibility during forming.','Sơn lót giúp sơn bám vào kim loại và tăng độ dẻo khi tạo hình.'],
['coat','top finish coat','lớp sơn hoàn thiện (mặt trên)','The top finish coat provides colour and protects against UV and weathering.','Lớp sơn hoàn thiện mặt trên tạo màu và bảo vệ chống tia UV, thời tiết.'],
['coat','back coat','lớp sơn mặt sau','The back coat protects the underside of the sheet and is usually thinner than the top coat.','Lớp sơn mặt sau bảo vệ mặt dưới tấm tôn và thường mỏng hơn lớp mặt trên.'],
['coat','polyester (PE)','sơn polyester (PE)','Polyester (PE) is one example of a top finish coating.','Polyester (PE) là một ví dụ về lớp sơn phủ hoàn thiện mặt trên.','polyester'],
['coat','silicone modified polyester (SMP)','polyester biến tính silicone (SMP)','Silicone modified polyester (SMP) is another option for the top finish coat.','Polyester biến tính silicone (SMP) là một lựa chọn khác cho lớp sơn mặt trên.','silicone modified polyester'],
['coat','PVDF','sơn PVDF (polyvinylidene fluoride)','The type of top coat, such as PVDF, is a key driver of the price premium.','Loại sơn phủ, như PVDF, là yếu tố chính tạo ra mức giá cao hơn.'],
['coat','protective film','màng bảo vệ bề mặt','A protective film shields architectural panels during transport and installation.','Màng bảo vệ che chắn tấm kiến trúc trong vận chuyển và lắp đặt.'],
['coat','cold rolled steel','thép cán nguội','Painted products typically use cold rolled steel as the substrate.','Sản phẩm sơn thường dùng thép cán nguội làm vật liệu nền.'],
['coat','steel grade','mác thép','Please confirm the steel grade required for this application.','Vui lòng xác nhận mác thép yêu cầu cho ứng dụng này.'],
['coat','yield strength','giới hạn chảy','The yield strength must meet the customer specification.','Giới hạn chảy phải đáp ứng yêu cầu kỹ thuật của khách hàng.'],
['coat','tensile strength','độ bền kéo','Tensile strength is reported on the Mill Test Certificate.','Độ bền kéo được ghi trên chứng chỉ thử nghiệm của nhà máy.'],
['coat','base metal thickness (BMT)','chiều dày thép nền (BMT, chưa tính lớp phủ)','The base metal thickness (BMT) excludes the metallic and paint coatings.','Chiều dày thép nền (BMT) không bao gồm lớp mạ và lớp sơn.','base metal thickness'],
['coat','coating mass','khối lượng lớp mạ (g/m²)','The coating mass affects the corrosion protection of the steel.','Khối lượng lớp mạ ảnh hưởng đến khả năng bảo vệ chống ăn mòn của thép.'],
['coat','coil','cuộn thép','We supply painted steel in coil form as well as profiled sheets.','Chúng tôi cung cấp thép sơn dạng cuộn cũng như tôn định hình.'],
['coat','profiled sheet','tôn định hình (cán sóng)','The coil is roll-formed into a profiled sheet for roofing.','Cuộn thép được cán tạo hình thành tôn định hình để lợp mái.','profiled sheet'],
['coat','formability','khả năng tạo hình','Good formability prevents the paint from cracking during bending.','Khả năng tạo hình tốt giúp sơn không bị nứt khi uốn.'],
['coat','delamination','hiện tượng bong tách lớp','Delamination means the coating layers separate from each other.','Bong tách lớp nghĩa là các lớp phủ tách rời nhau.'],
['coat','chalking','hiện tượng phấn hóa (bề mặt sơn)','Chalking appears as a powdery film on the paint surface after long UV exposure.','Phấn hóa xuất hiện dưới dạng lớp bột trên bề mặt sơn sau thời gian dài tiếp xúc UV.'],
['coat','fading','hiện tượng phai màu','Fading is a gradual loss of colour intensity over time.','Phai màu là sự giảm dần độ đậm của màu theo thời gian.'],
['coat','corrosion resistance','khả năng chống ăn mòn','Corrosion resistance depends on the coating system and the environment.','Khả năng chống ăn mòn phụ thuộc vào hệ lớp phủ và môi trường.'],
['coat','end application','ứng dụng cuối (mục đích sử dụng)','The end application, such as roofing or walling, drives the product specification.','Ứng dụng cuối như lợp mái hay ốp tường quyết định quy cách sản phẩm.'],

/* ---------- Quality & testing ---------- */
['qual','Mill Test Certificate (MTC)','chứng chỉ thử nghiệm của nhà máy','Please send the Mill Test Certificate (MTC) for this lot number.','Vui lòng gửi chứng chỉ thử nghiệm của nhà máy (MTC) cho số lô này.','Mill Test Certificate'],
['qual','lot number','số lô','We can trace the product back using the lot number.','Chúng tôi có thể truy xuất sản phẩm bằng số lô.'],
['qual','traceability','khả năng truy xuất nguồn gốc','Traceability allows us to link a complaint to a specific coil and batch.','Truy xuất nguồn gốc cho phép liên kết khiếu nại với cuộn và lô cụ thể.'],
['qual','specification','quy cách / yêu cầu kỹ thuật (spec)','The customer specification is attached to the inquiry.','Yêu cầu kỹ thuật của khách hàng được đính kèm trong yêu cầu báo giá.'],
['qual','tolerance','dung sai','The thickness must be within the agreed tolerance.','Độ dày phải nằm trong dung sai đã thỏa thuận.'],
['qual','inspection','kiểm tra, kiểm định','A visual inspection was carried out before dispatch.','Việc kiểm tra bằng mắt đã được thực hiện trước khi xuất hàng.'],
['qual','non-conformance','sự không phù hợp (lỗi không đạt yêu cầu)','A non-conformance was found on the test strip.','Một điểm không phù hợp đã được phát hiện trên dải thử.'],
['qual','root cause analysis','phân tích nguyên nhân gốc','We have started the root cause analysis for this complaint.','Chúng tôi đã bắt đầu phân tích nguyên nhân gốc cho khiếu nại này.'],
['qual','corrective action','hành động khắc phục','The corrective action will be completed by the end of the month.','Hành động khắc phục sẽ hoàn thành vào cuối tháng.'],
['qual','preventive action','hành động phòng ngừa','A preventive action is needed to avoid the same issue in future.','Cần có hành động phòng ngừa để tránh tái diễn vấn đề này.'],
['qual','salt spray test','thử nghiệm phun muối','The salt spray test evaluates corrosion resistance in a laboratory.','Thử nghiệm phun muối đánh giá khả năng chống ăn mòn trong phòng thí nghiệm.'],
['qual','T-bend test','thử uốn chữ T (độ bám sơn khi uốn)','The T-bend test checks paint adhesion and flexibility when the sheet is bent.','Thử uốn chữ T kiểm tra độ bám dính và độ dẻo của sơn khi uốn tấm.'],
['qual','impact test','thử va đập','The impact test shows whether the paint cracks under sudden load.','Thử va đập cho biết sơn có nứt khi chịu tải đột ngột hay không.'],
['qual','cross-cut adhesion test','thử bám dính ô vuông','A cross-cut adhesion test was performed on the sample.','Đã thực hiện thử bám dính ô vuông trên mẫu.'],
['qual','MEK rub test','thử cọ dung môi MEK (mức độ đóng rắn của sơn)','The MEK rub test is used to check the degree of paint cure.','Thử cọ MEK dùng để kiểm tra mức độ đóng rắn của sơn.'],
['qual','gloss level','độ bóng','The gloss level of the batch is within the customer requirement.','Độ bóng của lô hàng nằm trong yêu cầu của khách hàng.'],
['qual','film thickness','độ dày màng sơn','Film thickness is measured at several points across the width.','Độ dày màng sơn được đo tại nhiều điểm trên bề ngang.'],
['qual','colour difference (ΔE)','chênh lệch màu (ΔE)','The colour difference (ΔE) must be within the agreed limit.','Chênh lệch màu (ΔE) phải nằm trong giới hạn đã thỏa thuận.','colour difference'],
['qual','batch-to-batch variation','sai khác giữa các lô','The customer complained about batch-to-batch variation in shade.','Khách hàng khiếu nại về sự sai khác sắc độ giữa các lô.'],
['qual','Line Working Standard (LWS)','mẫu chuẩn làm việc trên dây chuyền (LWS)','A sample is taken from the run for the Line Working Standard (LWS).','Một mẫu được lấy từ lần chạy để làm mẫu chuẩn làm việc trên dây chuyền (LWS).','Line Working Standard'],
['qual','Temporary Line Standard (TLS)','mẫu chuẩn tạm thời trên dây chuyền (TLS)','A Temporary Line Standard (TLS) is used as the colour reference during the trial.','Mẫu chuẩn tạm thời (TLS) được dùng làm chuẩn màu trong lần chạy thử.','Temporary Line Standard'],
['qual','Quality Engineer','kỹ sư chất lượng','The Quality Engineer will write the trial proposal.','Kỹ sư chất lượng sẽ viết đề xuất chạy thử.'],

/* ---------- NSPE & process ---------- */
['nspe','Non-Standard Product Enquiry (NSPE)','yêu cầu sản phẩm phi tiêu chuẩn','A Non-Standard Product Enquiry (NSPE) is a variation outside the current market offer.','NSPE là yêu cầu biến thể nằm ngoài danh mục chào bán hiện tại.','Non-Standard Product Enquiry'],
['nspe','market offer','danh mục sản phẩm chào bán (tiêu chuẩn)','Anything outside the market offer is treated as an NSPE.','Bất cứ yêu cầu nào ngoài danh mục chào bán đều được xem là NSPE.'],
['nspe','standard capability','năng lực tiêu chuẩn','The system checks the request against our standard capability.','Hệ thống kiểm tra yêu cầu so với năng lực tiêu chuẩn của chúng ta.'],
['nspe','extended capability','năng lực mở rộng (cần quy tắc/phê duyệt đặc biệt)','The CFT evaluates the extended capability before accepting the request.','CFT đánh giá năng lực mở rộng trước khi chấp nhận yêu cầu.'],
['nspe','Cross-Functional Team (CFT)','nhóm liên chức năng (CFT)','The Cross-Functional Team (CFT) includes Sales, Planning, Procurement, Production, Quality, Logistics and Finance.','CFT gồm Kinh doanh, Kế hoạch, Mua hàng, Sản xuất, Chất lượng, Logistics và Tài chính.','Cross-Functional Team'],
['nspe','inquiry','yêu cầu của khách hàng (inquiry/enquiry)','The sales team logs every customer inquiry in the system.','Bộ phận bán hàng ghi nhận mọi yêu cầu của khách hàng vào hệ thống.'],
['nspe','quotation','báo giá','The quotation will be released once the CFT has approved the request.','Báo giá sẽ được phát hành sau khi CFT phê duyệt yêu cầu.'],
['nspe','feasibility','tính khả thi','We need to confirm the technical and commercial feasibility.','Chúng ta cần xác nhận tính khả thi về kỹ thuật và thương mại.'],
['nspe','approval workflow','quy trình phê duyệt (workflow)','The approval workflow sends reminders to the approvers.','Quy trình phê duyệt gửi nhắc nhở đến những người phê duyệt.'],
['nspe','Delegation of Authority (DoA)','phân quyền phê duyệt (DoA)','Approvals follow the Delegation of Authority (DoA).','Việc phê duyệt tuân theo phân quyền phê duyệt (DoA).','Delegation of Authority'],
['nspe','counter proposal','đề xuất thay thế / phản đề xuất','The CFT may share a counter proposal with the customer.','CFT có thể gửi đề xuất thay thế cho khách hàng.'],
['nspe','alternative product','sản phẩm thay thế','We recommend an alternative product that meets the same performance requirement.','Chúng tôi đề xuất sản phẩm thay thế đáp ứng cùng yêu cầu hiệu năng.'],
['nspe','rejection notification','thông báo từ chối','A rejection notification is sent with a valid reason.','Thông báo từ chối được gửi kèm lý do hợp lệ.'],
['nspe','pending with CFT','đang chờ CFT xử lý','The inquiry status is pending with CFT.','Trạng thái của yêu cầu là đang chờ CFT xử lý.'],
['nspe','minimum order quantity (MOQ)','số lượng đặt hàng tối thiểu (MOQ)','Non-standard products may carry a minimum order quantity (MOQ).','Sản phẩm phi tiêu chuẩn có thể có số lượng đặt hàng tối thiểu (MOQ).','minimum order quantity'],
['nspe','yield rate','tỷ lệ thu hồi (hiệu suất thành phẩm)','A low yield rate can lead to additional cost for non-standard orders.','Tỷ lệ thu hồi thấp có thể phát sinh chi phí bổ sung cho đơn hàng phi tiêu chuẩn.'],
['nspe','lead time','thời gian thực hiện (từ đặt hàng đến giao)','Please note the lead time may be longer for non-standard items.','Lưu ý thời gian thực hiện có thể dài hơn với hàng phi tiêu chuẩn.'],
['nspe','escalate','báo cáo lên cấp cao hơn','If the CFT cannot agree, we will escalate to the approvers.','Nếu CFT không thống nhất, chúng tôi sẽ báo cáo lên cấp phê duyệt.'],
['nspe','parking lot','danh sách vấn đề tạm hoãn (để xử lý sau)','Let us put this item in the parking lot and revisit it next week.','Hãy đưa mục này vào danh sách tạm hoãn và xem lại vào tuần sau.'],

/* ---------- Colour matching & trial ---------- */
['colr','colour matching','đối màu / pha màu theo yêu cầu','Colour matching is the most common reason for raising an NSPE.','Đối màu là lý do phổ biến nhất để tạo một NSPE.'],
['colr','colour panel','tấm màu mẫu','The customer signs the colour panel to approve the shade.','Khách hàng ký lên tấm màu mẫu để duyệt sắc độ.'],
['colr','paint supplier','nhà cung cấp sơn','The paint supplier will submit four samples for approval.','Nhà cung cấp sơn sẽ gửi bốn mẫu để phê duyệt.'],
['colr','sample approval','phê duyệt mẫu','Production starts only after the sample approval from the customer.','Sản xuất chỉ bắt đầu sau khi khách hàng phê duyệt mẫu.'],
['colr','colour registration','đăng ký màu (mã màu mới)','One approved panel is kept for colour registration.','Một tấm mẫu đã duyệt được giữ lại để đăng ký màu.'],
['colr','re-matching','đối màu lại','If the shade is not agreed, the supplier will do a re-matching.','Nếu sắc độ chưa được đồng ý, nhà cung cấp sẽ đối màu lại.'],
['colr','shade','sắc độ','The customer asked for a slightly darker shade.','Khách hàng yêu cầu sắc độ đậm hơn một chút.'],
['colr','wet sample','mẫu sơn ướt','The supplier sends a wet sample after the first paint batch.','Nhà cung cấp gửi mẫu sơn ướt sau lô sơn đầu tiên.'],
['colr','drawdown sample','mẫu kéo sơn (draw-down) trong phòng thí nghiệm','A drawdown sample is tested in the laboratory before the line trial.','Mẫu kéo sơn được thử trong phòng thí nghiệm trước khi chạy thử trên dây chuyền.'],
['colr','pre-shipment panel','tấm mẫu trước khi giao (từ nhà cung cấp sơn)','We compare the pre-shipment panel with the customer-approved panel.','Chúng tôi so sánh tấm mẫu trước khi giao với tấm mẫu khách đã duyệt.'],
['colr','trial run','chạy thử (sản xuất thử)','We will schedule a trial run on the paint line.','Chúng tôi sẽ lên lịch chạy thử trên dây chuyền sơn.'],
['colr','trial proposal','đề xuất chạy thử','The Quality Engineer distributes the trial proposal to the line team.','Kỹ sư chất lượng gửi đề xuất chạy thử cho tổ dây chuyền.'],
['colr','test strip','dải thử (cuộn/mẫu thử)','A test strip is produced according to the trial proposal.','Một dải thử được sản xuất theo đề xuất chạy thử.'],
['colr','paint line','dây chuyền sơn','The paint line is booked for the trial next Tuesday.','Dây chuyền sơn đã được đặt lịch cho đợt chạy thử vào thứ Ba tuần sau.'],
['colr','Line Leader','trưởng chuyền','The Line Leader completes the order if the test strip is successful.','Trưởng chuyền hoàn tất đơn hàng nếu dải thử đạt.'],

/* ---------- NPD ---------- */
['npd','idea generation','tạo ý tưởng','Idea generation draws on market research, technology and customer feedback.','Tạo ý tưởng dựa trên nghiên cứu thị trường, công nghệ và phản hồi của khách hàng.'],
['npd','feasibility study','nghiên cứu khả thi','A feasibility study evaluates technical, economic and legal viability.','Nghiên cứu khả thi đánh giá tính khả thi về kỹ thuật, kinh tế và pháp lý.'],
['npd','concept development','phát triển ý tưởng thành concept','During concept development we define features and performance characteristics.','Trong giai đoạn phát triển concept, chúng ta xác định tính năng và đặc tính hiệu năng.'],
['npd','prototype','mẫu thử nghiệm (nguyên mẫu)','A small-scale prototype is made to test the design.','Một nguyên mẫu quy mô nhỏ được làm ra để thử nghiệm thiết kế.'],
['npd','Minimum Viable Product (MVP)','sản phẩm khả dụng tối thiểu (MVP)','The Minimum Viable Product (MVP) lets us test the idea with customers early.','MVP cho phép thử ý tưởng với khách hàng từ sớm.','Minimum Viable Product'],
['npd','product refinement','tinh chỉnh sản phẩm','Product refinement uses feedback from testing and market analysis.','Tinh chỉnh sản phẩm dựa trên phản hồi từ thử nghiệm và phân tích thị trường.'],
['npd','final validation','xác nhận cuối cùng (kỹ thuật & thương mại)','Final validation confirms the product is technically and commercially viable.','Xác nhận cuối cùng khẳng định sản phẩm khả thi về kỹ thuật và thương mại.'],
['npd','production planning','lập kế hoạch sản xuất','Production planning covers the BOM, routing and sourcing.','Lập kế hoạch sản xuất bao gồm BOM, routing và nguồn cung.'],
['npd','pilot production','sản xuất thí điểm','Pilot production confirms we can make the product with consistent quality.','Sản xuất thí điểm xác nhận chúng ta có thể làm ra sản phẩm với chất lượng ổn định.'],
['npd','commercial trial','thử nghiệm thương mại (lô nhỏ cho khách chọn lọc)','A commercial trial with selected customers gives market feedback.','Thử nghiệm thương mại với khách hàng chọn lọc mang lại phản hồi thị trường.'],
['npd','launch','ra mắt (sản phẩm)','The launch is supported by marketing and sales campaigns.','Việc ra mắt được hỗ trợ bởi các chiến dịch marketing và bán hàng.'],
['npd','end of life','kết thúc vòng đời sản phẩm','At end of life we decide to discontinue, redesign or replace the product.','Khi kết thúc vòng đời, chúng ta quyết định ngừng, thiết kế lại hoặc thay thế sản phẩm.'],
['npd','gate approver','người phê duyệt tại cổng giai đoạn (stage gate)','The gate approver decides whether the project moves to the next stage.','Người phê duyệt cổng quyết định dự án có được chuyển sang giai đoạn tiếp theo không.'],
['npd','desirability','mức độ khách hàng mong muốn','Desirability asks whether customers really want this product.','Desirability hỏi liệu khách hàng có thực sự muốn sản phẩm này không.'],
['npd','viability','tính khả thi về kinh doanh (hiệu quả tài chính)','Viability looks at margin, pricing and the business case.','Viability xem xét biên lợi nhuận, giá bán và bài toán kinh doanh.'],
['npd','business case','bài toán kinh doanh','The business case must be approved before we start the prototype.','Bài toán kinh doanh phải được duyệt trước khi bắt đầu làm nguyên mẫu.'],
['npd','target market','thị trường mục tiêu','We need to define the target market before the customer survey.','Cần xác định thị trường mục tiêu trước khi khảo sát khách hàng.'],
['npd','product positioning','định vị sản phẩm','Product positioning explains how the product differs from competitors.','Định vị sản phẩm giải thích sản phẩm khác biệt thế nào so với đối thủ.'],
['npd','time to market','thời gian đưa sản phẩm ra thị trường','Time to market is measured from ideation to launch.','Thời gian ra thị trường được tính từ ý tưởng đến khi ra mắt.'],

/* ---------- Commercial & KPI ---------- */
['biz','response time','thời gian phản hồi','The NSPE response time is measured from logging to quotation acceptance.','Thời gian phản hồi NSPE tính từ lúc ghi nhận đến khi khách chấp nhận báo giá.'],
['biz','opportunity loss','mất cơ hội (doanh thu bị bỏ lỡ)','Non-converted quotations help us evaluate opportunity loss.','Các báo giá không chuyển đổi giúp chúng ta đánh giá mức mất cơ hội.'],
['biz','conversion rate','tỷ lệ chuyển đổi','We track the conversion rate from inquiry to order.','Chúng tôi theo dõi tỷ lệ chuyển đổi từ yêu cầu sang đơn hàng.'],
['biz','price premium','mức giá cao hơn (phần giá cộng thêm)','The premium coating supports a price premium.','Lớp phủ cao cấp hỗ trợ mức giá cao hơn.'],
['biz','margin','biên lợi nhuận','The extra cost reduces the margin on this order.','Chi phí phát sinh làm giảm biên lợi nhuận của đơn hàng này.'],
['biz','pricing strategy','chiến lược giá','The pricing strategy for the new product will be agreed with Finance.','Chiến lược giá cho sản phẩm mới sẽ được thống nhất với Tài chính.'],
['biz','competitor benchmarking','so sánh chuẩn với đối thủ','Competitor benchmarking shows where we are above or below the market.','So sánh với đối thủ cho thấy chúng ta cao hơn hay thấp hơn thị trường ở điểm nào.'],
['biz','value proposition','đề xuất giá trị','Our value proposition is durability and consistent colour.','Đề xuất giá trị của chúng ta là độ bền và màu sắc ổn định.'],
['biz','market segment','phân khúc thị trường','Which market segment is this customer in?','Khách hàng này thuộc phân khúc thị trường nào?'],
['biz','volume','sản lượng / khối lượng (tấn)','The expected volume is the key input to the feasibility check.','Khối lượng dự kiến là đầu vào quan trọng cho việc kiểm tra tính khả thi.'],
['biz','stakeholder','bên liên quan','Each stakeholder needs a clear update on the timeline.','Mỗi bên liên quan cần một cập nhật rõ ràng về tiến độ.'],
['biz','cost to serve','chi phí phục vụ khách hàng','Special requests increase the cost to serve.','Các yêu cầu đặc biệt làm tăng chi phí phục vụ.'],

/* ---------- Systems & data ---------- */
['sys','Advanced Variant Configuration (AVC)','cấu hình biến thể nâng cao (AVC)','Advanced Variant Configuration (AVC) checks whether an inquiry fits our standard offering.','AVC kiểm tra xem yêu cầu có nằm trong danh mục tiêu chuẩn hay không.','Advanced Variant Configuration'],
['sys','inconsistent configuration','cấu hình không nhất quán (ngoài tiêu chuẩn)','An inconsistent configuration triggers the NSPE process.','Cấu hình không nhất quán sẽ kích hoạt quy trình NSPE.'],
['sys','characteristic','đặc tính (thuộc tính cấu hình sản phẩm)','The NSPE flag is a characteristic in the product configuration.','Cờ NSPE là một đặc tính trong cấu hình sản phẩm.'],
['sys','material master','dữ liệu gốc vật tư (material master)','The Master Data Team updates the material master after approval.','Nhóm dữ liệu gốc cập nhật material master sau khi được duyệt.'],
['sys','Bill of Materials (BOM)','định mức vật tư (BOM)','The Bill of Materials (BOM) lists all the components of the product.','BOM liệt kê tất cả thành phần của sản phẩm.','Bill of Materials'],
['sys','routing','quy trình công nghệ (routing)','The routing defines the production steps and work centres.','Routing xác định các bước sản xuất và trung tâm gia công.'],
['sys','master data','dữ liệu gốc','Accurate master data is required before production planning.','Cần dữ liệu gốc chính xác trước khi lập kế hoạch sản xuất.'],
['sys','audit trail','nhật ký kiểm toán (lịch sử thay đổi)','Every change is recorded in the audit trail.','Mọi thay đổi đều được ghi lại trong nhật ký kiểm toán.'],
['sys','system of record','hệ thống ghi nhận chính thức','S/4HANA becomes the system of record for product management.','S/4HANA trở thành hệ thống ghi nhận chính thức cho quản lý sản phẩm.'],
['sys','satellite system','hệ thống vệ tinh (ứng dụng phụ ngoài ERP)','The standalone satellite system will be retired.','Hệ thống vệ tinh độc lập sẽ được ngừng sử dụng.'],
['sys','interface','giao diện tích hợp (interface)','There is an interface between Salesforce and SAP S/4HANA.','Có một interface giữa Salesforce và SAP S/4HANA.'],
['sys','workflow','quy trình tự động (workflow)','The workflow routes the request to each approver.','Workflow chuyển yêu cầu đến từng người phê duyệt.'],
['sys','retire (sunset)','ngừng sử dụng (khai tử) ứng dụng','We plan to sunset the old Power Apps solution.','Chúng tôi dự định khai tử giải pháp Power Apps cũ.','sunset'],
['sys','opportunity','cơ hội bán hàng (trong CRM)','The opportunity in Salesforce captures the customer requirement.','Opportunity trong Salesforce ghi nhận yêu cầu của khách hàng.'],
['sys','data migration','chuyển đổi dữ liệu','The data migration plan depends on the final design decision.','Kế hoạch chuyển đổi dữ liệu phụ thuộc vào quyết định thiết kế cuối cùng.'],

/* ---------- Phrases ---------- */
['talk','Could you walk me through the specification?','Anh/chị có thể giải thích chi tiết quy cách giúp tôi không?','Could you walk me through the specification?','Anh/chị có thể giải thích chi tiết quy cách giúp tôi không?','walk me through'],
['talk','Could you confirm the end application?','Anh/chị có thể xác nhận ứng dụng cuối được không?','Could you confirm the end application and the exposure environment?','Anh/chị có thể xác nhận ứng dụng cuối và môi trường sử dụng không?','confirm'],
['talk','This falls outside our standard offering.','Yêu cầu này nằm ngoài danh mục tiêu chuẩn của chúng tôi.','Based on our current capability, this falls outside our standard offering.','Dựa trên năng lực hiện tại, yêu cầu này nằm ngoài danh mục tiêu chuẩn.','outside'],
['talk','I will check the feasibility and get back to you by Friday.','Tôi sẽ kiểm tra tính khả thi và phản hồi anh/chị vào thứ Sáu.','I will check the feasibility and get back to you by Friday.','Tôi sẽ kiểm tra tính khả thi và phản hồi anh/chị vào thứ Sáu.','get back to you'],
['talk','We need approval from the CFT to move forward.','Chúng tôi cần CFT phê duyệt để tiến hành.','We need approval from the CFT to move forward.','Chúng tôi cần CFT phê duyệt để tiến hành.','move forward'],
['talk','The root cause is still under investigation.','Nguyên nhân gốc vẫn đang được điều tra.','The root cause is still under investigation; we will share the findings once the lab results are available.','Nguyên nhân gốc vẫn đang được điều tra; chúng tôi sẽ chia sẻ kết quả khi có số liệu phòng thí nghiệm.','under investigation'],
['talk','Could you share the coil number and photos?','Anh/chị có thể chia sẻ số cuộn và hình ảnh không?','Could you share the coil number and photos so that we can start the investigation?','Anh/chị có thể chia sẻ số cuộn và hình ảnh để chúng tôi bắt đầu điều tra không?','share'],
['talk','I would like to flag a risk on the lead time.','Tôi muốn lưu ý một rủi ro về thời gian thực hiện.','I would like to flag a risk on the lead time for this order.','Tôi muốn lưu ý một rủi ro về thời gian thực hiện của đơn hàng này.','flag a risk'],
['talk','Could we schedule a trial run next week?','Chúng ta có thể lên lịch chạy thử vào tuần sau không?','Could we schedule a trial run on the paint line next week?','Chúng ta có thể lên lịch chạy thử trên dây chuyền sơn vào tuần sau không?','schedule'],
['talk','The customer-approved panel is our reference.','Tấm mẫu khách đã duyệt là chuẩn tham chiếu của chúng ta.','For the colour shade, the customer-approved panel is our reference.','Về sắc độ màu, tấm mẫu khách đã duyệt là chuẩn tham chiếu của chúng ta.','reference'],
['talk','Let us park this item and revisit it next time.','Hãy tạm hoãn mục này và xem lại vào lần sau.','Let us park this item and revisit it in the next meeting.','Hãy tạm hoãn mục này và xem lại trong cuộc họp tới.','revisit'],
['talk','Just to confirm my understanding...','Để tôi xác nhận lại là mình hiểu đúng...','Just to confirm my understanding, the customer needs a custom colour for roofing, correct?','Để tôi xác nhận lại là mình hiểu đúng, khách cần màu riêng cho mái, đúng không?','confirm my understanding'],
['talk','Please find attached the test report.','Đính kèm là báo cáo thử nghiệm.','Please find attached the test report for your reference.','Đính kèm là báo cáo thử nghiệm để anh/chị tham khảo.','attached'],
['talk','We apologise for the inconvenience caused.','Chúng tôi xin lỗi vì sự bất tiện này.','We apologise for the inconvenience caused and are working on a solution.','Chúng tôi xin lỗi vì sự bất tiện này và đang tìm giải pháp.','apologise'],
['talk','Could you clarify the next steps and owners?','Anh/chị có thể làm rõ các bước tiếp theo và người phụ trách không?','Before we close, could you clarify the next steps and owners?','Trước khi kết thúc, anh/chị có thể làm rõ các bước tiếp theo và người phụ trách không?','owners'],
['talk','This is subject to MOQ and additional cost.','Điều này tùy thuộc vào MOQ và chi phí phát sinh.','The offer is subject to MOQ and additional cost.','Đề nghị này tùy thuộc vào MOQ và chi phí phát sinh.','subject to'],
['talk','The price is TBC until the CFT confirms.','Giá sẽ được xác nhận (TBC) sau khi CFT chốt.','The price is TBC until the CFT confirms the feasibility.','Giá sẽ được xác nhận sau khi CFT chốt tính khả thi.','TBC'],
['talk','Could you please prioritise this request?','Anh/chị có thể ưu tiên xử lý yêu cầu này được không?','Could you please prioritise this request? The customer is waiting for our reply.','Anh/chị có thể ưu tiên yêu cầu này được không? Khách hàng đang chờ phản hồi.','prioritise']
];
var SEQS = [
  { id: 'layers', e: '🧱', title: 'Cấu trúc thép phủ màu', lvl: 'Dễ',
    intro: 'Sắp xếp các lớp của thép phủ màu từ NGOÀI CÙNG (trên) xuống thép nền.',
    steps: ['Protective film (optional)', 'Top finish coat', 'Top primer coating', 'Chemical treatment layer', 'Metallic coating layer', 'Steel substrate'],
    vi: ['Màng bảo vệ tạm thời khi vận chuyển, gia công, lắp đặt', 'Tạo màu, chống UV, thời tiết, hóa chất', 'Kết nối giữa kim loại và sơn, tăng độ dẻo', 'Tăng bám dính, chống gỉ trắng và bong tách', 'Lớp mạ GI/GL – bảo vệ chống gỉ chính, lớp hy sinh', 'Thép nền – quyết định cơ tính và ứng dụng'] },
  { id: 'nspe', e: '🧭', title: 'Quy trình NSPE (TO-BE)', lvl: 'Trung bình',
    intro: 'Sắp xếp các bước xử lý một yêu cầu sản phẩm phi tiêu chuẩn từ lúc nhận yêu cầu đến khi cập nhật dữ liệu gốc.',
    steps: ['Receive the customer inquiry', 'Create the inquiry with product specifications', 'System shows "Inconsistency detected"', 'Sales sets "NSPE Required" = Yes (status: Pending with CFT)', 'Product Management raises the NSPE form and notifies CFT members', 'CFT members record their individual decisions', 'CFT meeting makes the final decision', 'Communicate the outcome to the customer', 'Master Data Team updates the product definition (if accepted)'],
    vi: ['Nhận yêu cầu từ khách hàng', 'Tạo inquiry với quy cách sản phẩm', 'Hệ thống báo cấu hình không nhất quán', 'Sales đặt "NSPE Required" = Yes, trạng thái chờ CFT', 'Product Management tạo form NSPE và thông báo CFT', 'Từng thành viên CFT ghi nhận quyết định', 'Họp CFT ra quyết định cuối', 'Thông báo kết quả cho khách (báo giá giá TBC hoặc từ chối)', 'Nhóm dữ liệu gốc cập nhật định nghĩa sản phẩm nếu được chấp nhận'] },
  { id: 'colour', e: '🎨', title: 'Quy trình đối màu', lvl: 'Trung bình',
    intro: 'Sắp xếp các bước từ yêu cầu màu mới đến khi hoàn tất chạy thử.',
    steps: ['Sales requests colour matching approval', 'Product Design contacts the paint supplier', 'Supplier submits colour samples', 'Customer approves the colour panel', 'Account Manager accepts the NSPE and the order', 'Procurement purchases the paint', 'Quality Assurance tests the pre-shipment panel', 'Trial run produces a test strip', 'Line Leader completes the order and collects the LWS sample'],
    vi: ['Sales xin duyệt để bắt đầu đối màu', 'Product Design/Technical Marketing liên hệ nhà cung cấp sơn', 'Nhà cung cấp gửi mẫu màu', 'Khách duyệt và ký tấm màu', 'Account Manager chấp nhận NSPE và đơn hàng', 'Mua hàng đặt mua sơn', 'QA thử nghiệm tấm mẫu trước khi giao', 'Chạy thử tạo dải thử', 'Trưởng chuyền hoàn tất đơn và lấy mẫu LWS'] },
  { id: 'npd', e: '🚀', title: 'Vòng đời NPD chi tiết', lvl: 'Khó',
    intro: 'Sắp xếp các giai đoạn NPD từ ý tưởng đến cuối vòng đời.',
    steps: ['Idea generation', 'Feasibility study', 'Concept development', 'Prototyping', 'Testing and evaluation', 'Product refinement', 'Final testing and validation', 'Production planning', 'Pilot production', 'Commercialisation and launch', 'Monitoring and review', 'End of life'],
    vi: ['Tạo ý tưởng', 'Nghiên cứu khả thi', 'Phát triển concept', 'Làm nguyên mẫu', 'Thử nghiệm và đánh giá', 'Tinh chỉnh sản phẩm', 'Thử nghiệm và xác nhận cuối', 'Lập kế hoạch sản xuất', 'Sản xuất thí điểm', 'Thương mại hóa và ra mắt', 'Theo dõi và rà soát', 'Kết thúc vòng đời'] },
  { id: 'stages', e: '🛤️', title: '6 giai đoạn NPD (đề xuất)', lvl: 'Dễ',
    intro: 'Sắp xếp 6 giai đoạn của quy trình NPD đề xuất.',
    steps: ['Concept', 'Discover', 'Test', 'Develop', 'Scale', 'Deliver'],
    vi: ['Khái niệm: nắm bắt cơ hội, xác định ý tưởng', 'Khám phá: xác minh concept, nhận diện GAP', 'Thử nghiệm: kế hoạch kinh doanh, mẫu thử', 'Phát triển: hoàn thiện công nghệ', 'Mở rộng: năng lực & sản xuất quy mô', 'Triển khai: ra mắt và đánh giá sau ra mắt'] }
];
var TERMS = RAW.map(function(r){return {cat:r[0],en:r[1],vi:r[2],ex:r[3],exvi:r[4]}});
var CHAPTERS = [
 {cat:'coat', name:'Xưởng mạ kẽm', seq:'layers'},
 {cat:'qual', name:'Phòng thí nghiệm', seq:'stages'},
 {cat:'nspe', name:'Phòng họp CFT', seq:'nspe'},
 {cat:'colr', name:'Lò pha màu', seq:'colour'},
 {cat:'npd',  name:'Trung tâm R&D', seq:'npd'},
 {cat:'biz',  name:'Văn phòng kinh doanh', seq:null},
 {cat:'sys',  name:'Trung tâm dữ liệu', seq:null},
 {cat:'talk', name:'Hội nghị khách hàng', seq:null}
];
var PER_CH = 4, LEVELS = CHAPTERS.length * PER_CH;
var STD = {mean:6000, rev:7000, listen:7000, cloze:10000, order:25000, bank:9000};

function hash(s){var h=2166136261;for(var i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function rng(seed){var a=seed>>>0;return function(){a=(a+0x6D2B79F5)>>>0;var t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296}}
function shuffle(arr,r){var a=arr.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(r()*(i+1));var x=a[i];a[i]=a[j];a[j]=x}return a}
function pick(arr,n,r,not){return shuffle(arr.filter(function(x){return not.indexOf(x)<0}),r).slice(0,n)}
function blank(t){var i=t.ex.toLowerCase().indexOf(t.en.toLowerCase());if(i<0){var w=t.en.split(' (')[0];i=t.ex.toLowerCase().indexOf(w.toLowerCase());if(i<0)return null;return t.ex.slice(0,i)+'_____'+t.ex.slice(i+w.length)}return t.ex.slice(0,i)+'_____'+t.ex.slice(i+t.en.length)}

/* level: 1..LEVELS. Trả về {level, chapter, questions:[...], std} — giống hệt nhau với mọi người */
var DEFAULT_CTX={slug:'steel',terms:TERMS,chapters:CHAPTERS,LEVELS:LEVELS};
/* Dựng bối cảnh đề cho một khóa học. words: [{cat,en,vi,ex,exvi}] theo đúng thứ tự trong DB (ord, id). */
/* bank: câu hỏi từ ngân hàng (status live) [{id,type,prompt,options,answer,cat,level_min}] */
function normBank(bank){return (bank||[]).filter(function(q){return q&&q.prompt&&Array.isArray(q.options)&&q.options.length>=2&&(q.type==='order'||(q.answer>=0&&q.answer<q.options.length))}).sort(function(a,b){return a.id-b.id})}
function buildCtx(track,words,bank){var c=buildCtx0(track,words);c.bank=normBank(bank);return c}
function buildCtx0(track,words){
 if(!track||track.slug==='steel'){var tw=(words&&words.length)?words:TERMS;return {slug:'steel',terms:tw,chapters:CHAPTERS,LEVELS:LEVELS}}
 var cats=Object.keys(track.cats||{}),chs=[],per=track.words_per_level||40;
 if(track.kind==='cefr'){cats.forEach(function(b){var bw=words.filter(function(w){return w.cat===b});for(var i=0;i*per<bw.length;i++){chs.push({cat:b,name:b+'.'+(i+1)+' · '+track.cats[b],seq:null,pool:bw.slice(i*per,(i+1)*per)})}})}
 else{cats.forEach(function(c){var cw=words.filter(function(w){return w.cat===c});if(cw.length)chs.push({cat:c,name:track.cats[c],seq:null,pool:cw})})}
 chs=chs.filter(function(c){return c.pool.length>=4});
 return {slug:track.slug,terms:words,chapters:chs,LEVELS:chs.length*PER_CH}}
function gen(level,ctx){ctx=ctx||DEFAULT_CTX;var TERMS=ctx.terms,CHAPTERS=ctx.chapters;
 var ci=Math.floor((level-1)/PER_CH), k=(level-1)%PER_CH, ch=CHAPTERS[ci], r=rng(hash(ctx.slug==='steel'?'steelspeak-saga-v1-L'+level:'steelspeak-saga-v1-'+ctx.slug+'-L'+level));
 var own=ch.pool||TERMS.filter(function(t){return t.cat===ch.cat});
 var prev=ci>0?[].concat.apply([],CHAPTERS.slice(0,ci).map(function(c){return c.pool||TERMS.filter(function(t){return t.cat===c.cat})})):[];
 var pool=kaka?own.concat(prev):k<3?own:own.concat(pick(prev,6,r,[]));
 var boss=(k===PER_CH-1)||level%10===0, kaka=level%10===0;
 var plan=kaka?['cloze','listen','cloze','rev','listen','cloze','listen','rev','cloze','listen','order','cloze','listen','rev','cloze','listen','cloze','listen']:boss?['cloze','listen','rev','cloze','listen','rev','cloze','listen','order','rev','cloze','listen']:[['mean','mean','rev','mean','listen','rev','mean','listen','cloze','mean'],
           ['mean','rev','listen','cloze','mean','rev','listen','cloze','mean','rev'],
           ['rev','listen','cloze','mean','listen','cloze','rev','mean','cloze','order'],
           ['cloze','listen','rev','cloze','listen','mean','cloze','rev','listen','order']][k];
 // Câu xếp thứ tự: ưu tiên quy trình trong ngân hàng (admin sửa được) theo đúng chương, nếu không có thì dùng quy trình mặc định
 var bOrd=(ctx.bank||[]).filter(function(q){return q.type==='order'&&q.cat&&q.cat===ch.cat&&(q.level_min||1)<=level});
 var seq=null;
 if(bOrd.length){var bo=bOrd[Math.floor(rng(hash('ord-'+ctx.slug+'-L'+level))()*bOrd.length)];seq={id:'bank'+bo.id,bank:bo.id,title:bo.prompt,steps:bo.options.map(String)}}
 else if(ch.seq)seq=SEQS.filter(function(s){return s.id===ch.seq})[0]||null;
 if(boss&&!seq)plan=plan.map(function(x){return x==='order'?'cloze':x});
 var used=[],qs=[];
 plan.forEach(function(type){
  if(type==='order'){
   if(seq){var all=seq.steps.length<=7,start=all?0:Math.floor(r()*Math.max(1,seq.steps.length-4)),steps=all?seq.steps.slice():seq.steps.slice(start,start+5);
    qs.push({type:'order',bank:seq.bank,prompt:all?seq.title:seq.title+' (bước '+(start+1)+'–'+(start+steps.length)+')',items:shuffle(steps.map(function(s,i){return {i:i,t:s}}),r),n:steps.length});return}
   type='cloze'}
  var t=pick(pool,1,r,used)[0]||pick(own,1,r,[])[0];used.push(t);
  if(type==='cloze'&&!blank(t))type='rev';
  var others=pick(own.length>=8?own:TERMS,3,r,[t]);var opts=shuffle([t].concat(others),r);
  var q={type:type,term:t.en,ans:opts.indexOf(t)};
  if(type==='mean'){q.prompt=t.en;q.opts=opts.map(function(o){return o.vi})}
  else if(type==='rev'){q.prompt=t.vi;q.opts=opts.map(function(o){return o.en})}
  else if(type==='listen'){q.prompt=t.en;q.opts=opts.map(function(o){return o.en})}
  else{q.prompt=blank(t);q.hint=t.exvi;q.opts=opts.map(function(o){return o.en})}
  qs.push(q)});
 // Trộn câu hỏi từ ngân hàng (thay câu mean/rev/cloze, tối đa 2; trùm 3)
 var bk=(ctx.bank||[]).filter(function(q){return (q.level_min||1)<=level&&(!q.cat||q.cat===ch.cat)&&!(q.type==='order'&&q.cat)});
 if(bk.length){var rb=rng(hash('bank-'+ctx.slug+'-L'+level+'-'+bk.length)),take=pick(bk,boss?3:2,rb,[]);
  var slots=[];qs.forEach(function(q,i){if(q.type==='mean'||q.type==='rev'||q.type==='cloze')slots.push(i)});slots=shuffle(slots,rb);
  take.forEach(function(b,j){if(j>=slots.length)return;var nq;
   if(b.type==='order')nq={type:'order',bank:b.id,prompt:b.prompt,items:shuffle(b.options.map(function(t,i){return {i:i,t:String(t)}}),rb),n:b.options.length};
   else{var o=shuffle(b.options.map(function(t,i){return {i:i,t:String(t)}}),rb);nq={type:'bank',bank:b.id,prompt:b.prompt,opts:o.map(function(x){return x.t}),ans:o.map(function(x){return x.i}).indexOf(b.answer),expl:b.explanation||''}}
   qs[slots[j]]=nq})}
 var std=qs.reduce(function(a,q){return a+STD[q.type]},0);if(kaka)std=Math.round(std*0.55);else if(boss)std=Math.round(std*0.8);
 return {level:level,chapter:ci,name:ch.name,cat:ch.cat,questions:qs,std:std,boss:boss,kaka:kaka,penalty:kaka?6000:2000,bonus:kaka?900:boss?300:0,s1:kaka?0.85:boss?0.75:0.6,s2:kaka?0.95:boss?0.85:0.8}}

/* answers: [{a: số thứ tự đáp án | mảng thứ tự (order), ms: thời gian của câu}] */
function grade(level,answers,ctx){
 var L=gen(level,ctx),correct=0,ms=0,wrong=0;
 L.questions.forEach(function(q,i){var x=answers[i]||{};var t=Math.max(0,Math.min(120000,+x.ms||0));ms+=t;
  var ok=q.type==='order'?(Array.isArray(x.a)&&x.a.length===q.n&&x.a.every(function(v,j){return q.items[v]&&q.items[v].i===j})):(x.a===q.ans);
  if(ok)correct++;else wrong++});
 var minHuman=L.questions.length*900;var suspicious=ms<minHuman;
 ms+=wrong*L.penalty;
 var n=L.questions.length,rt=correct/n;
 var stars=correct===n&&ms<=L.std*0.75?3:rt>=L.s2&&ms<=L.std?2:rt>=L.s1?1:0;
 var overdrive=correct===n&&ms<=L.std*0.5;
 var score=correct*100+Math.max(0,Math.round((L.std-ms)/100))+(overdrive?200:0)+(stars?L.bonus:0);
 if(suspicious){stars=0;score=0;overdrive=false}
 return {level:level,correct:correct,total:L.questions.length,ms:ms,std:L.std,stars:stars,score:score,overdrive:overdrive,suspicious:suspicious,boss:L.boss,kaka:L.kaka}}

var api={TERMS:TERMS,CATS:CATS,CHAPTERS:CHAPTERS,PER_CH:PER_CH,LEVELS:LEVELS,gen:gen,grade:grade,buildCtx:buildCtx};
root.SAGA=api;
})(typeof globalThis!=='undefined'?globalThis:this);

// ===== Supabase Edge Function "saga": chấm điểm level trên máy chủ (chống sửa điểm) =====
// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2.45.4";
const SAGA = (globalThis as any).SAGA;
const cors = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, apikey, content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const uc = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } } });
    const { data: { user } } = await uc.auth.getUser();
    if (!user) return json({ error: "Chưa đăng nhập" }, 401);
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const b = await req.json();
    // Khóa học: phải tham gia (đã duyệt) mới được đua
    const slug = String(b.track || "steel");
    const { data: track } = await admin.from("tracks").select("*").eq("slug", slug).maybeSingle();
    let ctx = null, trackId = null;
    if (track) {
      trackId = track.id;
      const { data: enr } = await admin.from("enrollments").select("status").eq("user_id", user.id).eq("track_id", track.id).maybeSingle();
      if (!enr || enr.status !== "approved") return json({ error: "Bạn chưa tham gia khóa học này" }, 403);
      const { data: ws } = await admin.from("words").select("term,meaning_vi,example,example_vi,cat,cefr").eq("track_id", track.id).eq("status", "approved").order("ord").order("id").limit(5000);
      const words = (ws ?? []).map((w) => ({ cat: w.cat || w.cefr || "misc", en: w.term, vi: w.meaning_vi, ex: w.example || "", exvi: w.example_vi || "" }));
      let bank: unknown[] = [];
      try { const { data: qb } = await admin.from("question_bank").select("id,type,prompt,options,answer,explanation,cat,level_min").eq("track_id", track.id).eq("status", "live").order("id").limit(2000); bank = qb ?? []; } catch (_) { /* chưa có bảng */ }
      ctx = SAGA.buildCtx(track, words, bank);
    } else if (slug !== "steel") return json({ error: "Không tìm thấy khóa học" }, 404);
    const LEVELS = ctx ? ctx.LEVELS : SAGA.LEVELS;
    const level = Math.floor(Number(b.level));
    if (!(level >= 1 && level <= LEVELS)) return json({ error: "Level không hợp lệ" }, 400);

    // Chỉ được chơi level đã mở khoá (theo khóa học)
    let q = admin.from("saga_scores").select("level,stars,overdrive").eq("user_id", user.id).gte("stars", 1);
    if (trackId) q = q.eq("track_id", trackId);
    const { data: rows } = await q;
    let maxOpen = 1;
    for (const r of rows ?? []) maxOpen = Math.max(maxOpen, r.level + 1);
    if (level > maxOpen) return json({ error: "Level này chưa mở khoá" }, 403);

    // Chống gửi dồn dập: tối đa 1 lượt / 15 giây
    const { data: last } = await admin.from("saga_scores").select("created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (last && Date.now() - new Date(last.created_at).getTime() < 15000) return json({ error: "Thao tác quá nhanh, thử lại sau ít giây" }, 429);

    const answers = Array.isArray(b.answers) ? b.answers.slice(0, 20) : [];
    const r = SAGA.grade(level, answers, ctx || undefined);
    const { error } = await admin.from("saga_scores").insert({ user_id: user.id, track_id: trackId, level, correct: r.correct, ms: r.ms, score: r.score, stars: r.stars, overdrive: r.overdrive });
    if (error) return json({ error: error.message }, 500);
    return json(r);
  } catch (e) {
    return json({ error: String((e as Error).message ?? e) }, 500);
  }
});
