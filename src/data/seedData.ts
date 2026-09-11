import { Notebook, ResearchSource, UserProfile, StudioSavedItem, ChatMessage } from '../types';

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'usr_dwiptamoy',
    name: 'Dwiptamoy',
    email: 'dwiptamoyforleo@gmail.com',
    role: 'Principal Research Scientist',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  },
  {
    id: 'usr_clara',
    name: 'Dr. Clara Sterling',
    email: 'clara.sterling@institute.edu',
    role: 'Postdoctoral Research Fellow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  },
];

export function getInitialUserData(userId: string) {
  const now = Date.now();
  const day = 86400000;

  if (userId === 'usr_clara') {
    // Clara has her own isolated single notebook
    const notebookId = 'nb_neuro_clara';
    const notebooks: Notebook[] = [
      {
        id: notebookId,
        userId: 'usr_clara',
        title: 'Synaptic Plasticity & Long-Term Potentiation',
        description: 'Empirical review of NMDA receptor activation cascades during memory consolidation.',
        color: 'emerald',
        tags: ['Neurobiology', 'LTP', 'Synapses'],
        isFavorite: true,
        isArchived: false,
        createdAt: now - 3 * day,
        updatedAt: now - day,
      },
    ];

    const sources: ResearchSource[] = [
      {
        id: 'src_clara_1',
        notebookId,
        title: 'Molecular Mechanisms of Hippocampal LTP (Nature Rev)',
        type: 'pdf',
        fileSize: '3.4 MB',
        wordCount: 8420,
        charCount: 52100,
        uploadedAt: now - 3 * day,
        isSelected: true,
        citationIndex: 1,
        status: 'indexed',
        author: 'Sterling & Malenka et al.',
        publishedYear: '2025',
        content: `Molecules of Memory: Glutamatergic Synapses and Post-Synaptic Density Remodeling.
Abstract:
Long-term potentiation (LTP) is widely recognized as the primary cellular model for learning and memory. Here we evaluate the biphasic activation of calcium/calmodulin-dependent protein kinase II (CaMKII) following calcium influx through NMDA receptors.
Key findings:
1. Theta-burst stimulation triggers transient dendritic spine enlargement (structural LTP) occurring within 120 seconds of induction.
2. AMPA receptor insertion into the postsynaptic density is mediated by Stargazin phosphorylation, resulting in a persistent 240% increase in miniature EPSC amplitudes.
3. Retrograde nitric oxide (NO) signaling recruits presynaptic vesicular release probability, cementing dual-locus synaptic consolidation.
Discussion:
Targeted pharmacological inhibition of CaMKII autophosphorylation at Thr286 selectively impairs late-phase LTP without disrupting basal synaptic transmission.`,
      },
    ];

    const messages: ChatMessage[] = [
      {
        id: 'msg_c1',
        conversationId: 'conv_clara_1',
        role: 'user',
        content: 'What is the role of CaMKII autophosphorylation in structural LTP?',
        timestamp: now - 2 * day,
      },
      {
        id: 'msg_c2',
        conversationId: 'conv_clara_1',
        role: 'assistant',
        content: `### Role of CaMKII in Structural LTP\n\nBased on your source, **CaMKII autophosphorylation at Thr286** operates as an autonomous molecular memory switch [1]:\n\n1. **Kinase Trapping**: Calcium influx via NMDA receptors induces calmodulin binding, exposing Thr286 for intra-holoenzyme phosphorylation.\n2. **Postsynaptic Anchoring**: Phosphorylated CaMKII translocates to the postsynaptic density (PSD) and binds directly to the NMDA receptor GluN2B subunit [1].\n3. **AMPA Clustering**: It subsequently phosphorylates TARPs (Stargazin), stabilizing newly exocytosed AMPA receptors in the perisynaptic membrane.\n\n*Reference: [1] Molecular Mechanisms of Hippocampal LTP.*`,
        timestamp: now - 2 * day + 3000,
        citations: [{ index: 1, sourceId: 'src_clara_1', sourceTitle: 'Molecular Mechanisms of Hippocampal LTP' }],
      },
    ];

    return { notebooks, sources, messages, savedItems: [] };
  }

  // Primary User (Dwiptamoy) Notebooks
  const nb1 = 'nb_quantum_error';
  const nb2 = 'nb_cognitive_memory';
  const nb3 = 'nb_battery_storage';

  const notebooks: Notebook[] = [
    {
      id: nb1,
      userId: 'usr_dwiptamoy',
      title: 'Quantum Computing: Surface Codes & Fault Tolerance',
      description: 'Analysis of topological surface codes, magic state distillation, and sub-threshold physical error rates.',
      color: 'indigo',
      tags: ['Quantum Hardware', 'QEC', 'Surface Codes'],
      isFavorite: true,
      isArchived: false,
      createdAt: now - 5 * day,
      updatedAt: now - 15 * 60000,
    },
    {
      id: nb2,
      userId: 'usr_dwiptamoy',
      title: 'Cognitive Neuroscience: Memory Consolidation During Sleep',
      description: 'Systemic review of hippocampal-neocortical dialog, sharp-wave ripples, and slow-wave oscillations in REM/NREM sleep.',
      color: 'emerald',
      tags: ['Neuroscience', 'Memory', 'SWS'],
      isFavorite: true,
      isArchived: false,
      createdAt: now - 8 * day,
      updatedAt: now - 2 * day,
    },
    {
      id: nb3,
      userId: 'usr_dwiptamoy',
      title: 'Grid-Scale Battery Storage: LCOE & Chemistry Benchmarks',
      description: 'Comparative economics of Sodium-Ion, LFP, and Flow batteries for 8h+ long-duration energy storage.',
      color: 'amber',
      tags: ['CleanTech', 'Energy Storage', 'LCOE'],
      isFavorite: false,
      isArchived: false,
      createdAt: now - 14 * day,
      updatedAt: now - 4 * day,
    },
  ];

  const sources: ResearchSource[] = [
    // Notebook 1 Sources
    {
      id: 'src_q1',
      notebookId: nb1,
      title: 'Physical Thresholds in Rotated Planar Surface Codes (arXiv:2410)',
      type: 'pdf',
      fileSize: '4.8 MB',
      wordCount: 11200,
      charCount: 71400,
      uploadedAt: now - 5 * day,
      isSelected: true,
      citationIndex: 1,
      status: 'indexed',
      author: 'Fowler, Martinis & Devoret',
      publishedYear: '2025',
      content: `SURFACE CODES TOWARDS FAULT-TOLERANT QUANTUM ARCHITECTURES.
Section 1: Theoretical Error Thresholds.
The rotated planar surface code encodes a single logical qubit in an array of d x d data qubits interspersed with (d^2 - 1) syndrome measurement ancillae. The standard threshold under depolarizing circuit-level noise is p_th ≈ 1.05%. When two-qubit gate fidelities exceed 99.3%, logical error rates decay exponentially as:
P_logical ~ C * (p / p_th)^((d + 1) / 2).

Section 2: Syndrome Extraction Cycles.
Repetitive stabilizer readout requires continuous X-type and Z-type measurement rounds. Crucially, leakage into non-computational states (|2> and |3> in superconducting transmons) breaks Pauli error assumptions. Implementing autonomous leakage-reduction units (LRU) suppresses leakage propagation by 98.4%.

Section 3: Magic State Distillation Overhead.
To achieve universal fault-tolerant computation, non-Clifford T gates must be injected via magic state distillation factories. Standard 15-to-1 distillation routines demand roughly 70% to 85% of total physical qubit allocation, underlining the urgent necessity for high-fidelity native non-Clifford gates or lattice surgery braiding.`,
    },
    {
      id: 'src_q2',
      notebookId: nb1,
      title: 'Superconducting Transmon Gate Fidelity Benchmarks (IBM/Google Joint Whitepaper)',
      type: 'doc',
      fileSize: '2.1 MB',
      wordCount: 6840,
      charCount: 42100,
      uploadedAt: now - 4 * day,
      isSelected: true,
      citationIndex: 2,
      status: 'indexed',
      author: 'Quantum Systems Engineering Group',
      publishedYear: '2025',
      content: `EMPIRICAL BENCHMARKS FOR SCALABLE TRANSMON PROCESSORS.
Executive Summary:
Recent 127-qubit and 433-qubit heavy-hexagonal lattice architectures demonstrate median CZ gate errors of 0.38% (0.0038), firmly placing them below the surface code fault-tolerance threshold.

Crosstalk Mitigation:
Stray ZZ coupling remains the principal coherent error source in fixed-frequency transmon networks. By incorporating tunable capacitive couplers with zero-point flux bias, residual parasitic ZZ interaction is suppressed from 1.2 MHz to under 8 kHz.

Thermal Decoherence and Cryogenic Thermal Budgets:
Dilution refrigerator cooling limits dissipation at the 15 mK mixing chamber to approximately 20 µW. Optoelectronic control lines or multiplexed cryo-CMOS controllers operating at 4 Kelvin represent the sole viable route to scaling beyond 10,000 physical qubits.`,
    },
    {
      id: 'src_q3',
      notebookId: nb1,
      title: 'NIST Post-Quantum Cryptography Migration & Shor Threat Horizons',
      type: 'text',
      fileSize: '1.2 MB',
      wordCount: 4300,
      charCount: 28900,
      uploadedAt: now - 3 * day,
      isSelected: true,
      citationIndex: 3,
      status: 'indexed',
      author: 'NIST Information Security Directorate',
      publishedYear: '2024',
      content: `TIMELINE ESTIMATION FOR CRYPTANALYTIC QUANTUM COMPUTERS (CRQC).
Shor's Algorithm Resource Estimation:
Factoring RSA-2048 integers in 8 hours of continuous runtime requires approximately 4,096 logical qubits and 1.8 x 10^9 Toffoli gates. Assuming physical error rates of 10^-3 and a surface code distance d = 27, the gross hardware requirement equates to roughly 6 x 10^6 physical qubits.

Migration Urgency:
Adversaries continue executing "Store Now, Decrypt Later" (SNDL) attacks against sovereign communications. Standardization of ML-KEM (Kyber) and ML-DSA (Dilithium) establishes immediate quantum-resistant alternatives for all federal and critical infrastructure deployments.`,
    },

    // Notebook 2 Sources
    {
      id: 'src_n1',
      notebookId: nb2,
      title: 'Hippocampal-Neocortical Dialogue & Sharp-Wave Ripples (Science)',
      type: 'pdf',
      fileSize: '5.2 MB',
      wordCount: 9500,
      charCount: 62000,
      uploadedAt: now - 8 * day,
      isSelected: true,
      citationIndex: 1,
      status: 'indexed',
      author: 'Buzsáki & Wilson',
      publishedYear: '2024',
      content: `COORDINATION OF HIPPOCAMPAL SHARP-WAVE RIPPLES AND CORTICAL SLOW OSCILLATIONS.
During non-rapid eye movement (NREM) sleep, transient high-frequency oscillations known as sharp-wave ripples (SWRs; 150-250 Hz) emerge in CA1/CA3 hippocampal subfields. SWRs exhibit time-compressed replay of waking neuronal firing sequences, broadcasting episodic traces to the prefrontal cortex during the depolarizing 'up-states' of slow oscillations (<1 Hz).`,
    },
  ];

  const messages: ChatMessage[] = [
    {
      id: 'msg_q_1',
      conversationId: 'conv_q1',
      role: 'user',
      content: 'How many physical qubits are needed to run Shor’s algorithm on RSA-2048, and what is the bottleneck?',
      timestamp: now - 2 * 3600000,
    },
    {
      id: 'msg_q_2',
      conversationId: 'conv_q1',
      role: 'assistant',
      content: `### Physical Qubit Requirements & Bottlenecks for RSA-2048 Factoring\n\nBased on the analysis across your attached sources, breaking RSA-2048 using Shor's algorithm requires approximately **6 million physical qubits** under realistic noise assumptions [1, 3].\n\n#### Key Architectural Breakdown\n1. **Logical vs. Physical Scaling**:\n   - Shor's algorithm for 2048-bit integers demands **~4,096 logical qubits** and **1.8 × 10⁹ Toffoli gates** [3].\n   - To protect each logical qubit against circuit-level noise, a surface code distance of **d = 27** is necessary, scaling the physical qubit count exponentially relative to gate fidelity [1].\n\n2. **The Magic State Distillation Bottleneck**:\n   - High-fidelity non-Clifford operations (T gates) cannot be implemented transversally. As documented in [1], **70% to 85% of all physical qubits are consumed solely by 15-to-1 magic state distillation factories**, rather than holding algorithm data.\n\n3. **Cryogenic Thermal Ceiling**:\n   - Dilution refrigerators provide only **~20 µW of cooling power at 15 mK** [2]. Routing individual coaxial lines for millions of qubits would dump fatal thermal loads into the mixing chamber without cryo-CMOS multiplexing [2].\n\n#### Strategic Implications\nBecause of the massive physical overhead, adversaries are currently relying on *"Store Now, Decrypt Later"* attacks while NIST standardizes lattice-based post-quantum cryptography (ML-KEM and ML-DSA) [3].`,
      timestamp: now - 2 * 3600000 + 4000,
      citations: [
        { index: 1, sourceId: 'src_q1', sourceTitle: 'Physical Thresholds in Rotated Planar Surface Codes' },
        { index: 2, sourceId: 'src_q2', sourceTitle: 'Superconducting Transmon Gate Fidelity Benchmarks' },
        { index: 3, sourceId: 'src_q3', sourceTitle: 'NIST Post-Quantum Cryptography Migration' },
      ],
    },
  ];

  const savedItems: StudioSavedItem[] = [
    {
      id: 'saved_1',
      notebookId: nb1,
      toolType: 'summary',
      title: 'Quantum Error Correction Synthesis',
      createdAt: now - 3 * 3600000,
      tags: ['Executive Summary', 'QEC'],
      data: {
        executiveSummary: 'This workspace synthesizes critical findings on surface codes, cryogenic scaling, and post-quantum migration timelines. Surface codes operating with 99.3%+ two-qubit gate fidelities cross the physical threshold, but magic state distillation remains the dominant hardware burden.',
        keyHighlights: [
          'Rotated planar surface code threshold is established at p_th ≈ 1.05% [1].',
          'Magic state factories consume between 70% and 85% of total hardware footprint [1].',
          'Parasitic ZZ crosstalk reduced below 8 kHz with tunable couplers [2].',
          'RSA-2048 factoring demands ~6M physical qubits with code distance d=27 [3].',
        ],
      },
    },
  ];

  return { notebooks, sources, messages, savedItems };
}
